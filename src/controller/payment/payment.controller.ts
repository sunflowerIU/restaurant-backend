import type { Request, Response } from "express";
import z, { json } from "zod";
import { PaymentInitiateSchema } from "./payment.schema";
import { Idempotencykey } from "../../model/idempotency.mode";
import { buildPaymentFingerprint } from "../../lib/buildPaymentFingerPrint";
import { Product } from "../../model/product.model";
import { Payment } from "../../model/payment.model";
import { createEsewaHmac } from "../../lib/createEsewaHmac";
import { Order } from "../../model/order.model";
import { AuthenticatedRequest } from "../../lib/AuthenticatedRequest";

export async function initiatePayment(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) return res.status(401).json({ message: "unauthorized" });
  //   console.log(req.body);
  const idempotencyKey = req.header("Idempotency-Key");
  if (!idempotencyKey)
    return res.status(400).json({ message: "idempotency key required" });

  const result = z.safeParse(PaymentInitiateSchema, req.body);

  if (!result.success) {
    return res.status(400).json({
      message: result.error.issues[0].message,
    });
  }
  //   console.log(result.data);

  try {
    //check if current user is really accessing order which he did
    const order = await Order.findById(result.data.orderId);
    if (!order) return res.status(404).json({ message: "invalid order id" });

    if (req.user.id !== order.userId?.toString()) {
      return res.status(404).json({ message: "Cannot check others order" });
    }

    const requestHash = buildPaymentFingerprint(result.data);
    //first check if idempotency key exists
    const existing = await Idempotencykey.findOne({
      key: idempotencyKey,
      route: "POST:/payment/initiate",
    });

    //if that idempotency exists already
    if (existing) {
      if (existing.requestHash !== requestHash) {
        return res.status(409).json({
          message:
            "This idempotency key was already used for different request",
        });
      }

      if (existing.status === "completed") {
        return res.status(existing.responseCode || 200).json({
          message:
            "This idempotency key was already used for different request",
        });
      }

      if (existing.status === "processing") {
        return res.status(409).json({
          message: "A matching checkout has been processed already.",
        });
      }
    }
    ///now check if the items are valid and get total
    //1. first collect the requested productids
    const productsIds = result.data.items.map((item) => item.productId);

    //2. fetch available products from db
    const products = await Product.find({
      _id: { $in: productsIds },
      isAvailable: true,
    });
    // console.log(products);

    //3. ensure if item is unavailable then return error
    const currentlyAvailableItemsId = new Set(
      products.map((product) => product.id),
    );
    const unavailableItems = productsIds.filter(
      (id) => !currentlyAvailableItemsId.has(id),
    );
    // console.log("unavailable", unavailableItems);

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        message: "following items not available currently",
        data: unavailableItems,
      });
    }

    //4. make lookup map for fast access
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    //5 final cartItems list from db
    const cartItems = result.data.items.map(
      (item: { qty: number; productId: string }) => {
        const currentProduct = productMap.get(item.productId);

        if (!currentProduct) {
          throw new Error("Cant find the product");
        }

        const qty = Number(item.qty);
        const price = Number(currentProduct.price);

        return {
          productId: currentProduct.id,
          qty,
          price,
          name: currentProduct.name,
          imageSrc: currentProduct.imageSrc,
        };
      },
    );
    // console.log(cartItems);
    //find subtotal
    const subTotal = cartItems.reduce(
      (acc, item) => acc + item.qty * item.price,
      0,
    );

    // console.log(subTotal);

    const shippingFee = +process.env.SHIPPING_FEE!;

    const totalAmount = subTotal + shippingFee;

    // console.log(cartItems, subTotal, totalAmount);

    const payment = await Payment.create({
      orderId: result.data.orderId,
      gateway: result.data.gateway,
      amount: totalAmount,
      status: "initiated",
      gatewayTransactionId: crypto.randomUUID(),
    });

    const paymentString = `total_amount=${totalAmount},transaction_uuid=${payment.gatewayTransactionId},product_code=EPAYTEST`;

    const paymentBase64String = createEsewaHmac(paymentString);
    // console.log(paymentBase64String);

    return res.status(200).json({
      gateway: "esewa",
      formAction: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      fields: {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: totalAmount,
        transaction_uuid: payment.gatewayTransactionId,
        product_code: "EPAYTEST",
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${process.env.FRONTEND_URL}/payment/esewa/success/${payment.id}`,
        failure_url: `${process.env.FRONTEND_URL}/payment/esewa/failure/${payment.id}`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: paymentBase64String,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to create your order",
    });
  }
}

//verify payment
export async function verifyPayment(req: Request, res: Response) {
  const statusType = ["failure", "success"];
  const { status, paymentId } = req.params as {
    status: string;
    paymentId: string;
  };

  const { data: dataString } = req.query as {
    data: string;
  };
  // console.log(req.query);

  if (!statusType.includes(status) || !dataString || !paymentId) {
    return res.status(400).json({ message: "invalid url" });
  }

  const paymentResponse = JSON.parse(
    Buffer.from(dataString, "base64").toString("utf-8"),
  );
  console.log(paymentResponse);
  try {
    //get that payment amount
    const payment = await Payment.findById(paymentId);

    if (!payment) return res.status(400).json({ message: "invalid payment" });
    const order = await Order.findById(payment.orderId);
    if (!order) return res.status(400).json({ message: "invalid payment" });

    // /check the status of payment
    const response = await fetch(
      `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${payment.amount}&transaction_uuid=${paymentResponse.transaction_uuid}`,
    );

    const data = await response.json();

    if (!response.ok)
      return res
        .status(400)
        .json({ message: "could not get data from payment server" });

    if (data.status === "COMPLETE") {
      payment.status = "paid";
      order.paymentStatus = "paid";
    } else if (data.status === "CANCELED") {
      payment.status = "failed";
      order.paymentStatus = "failed";
    } else {
      payment.status = "expired";
      order.paymentStatus = "pending";
    }

    payment.gatewayReferenceId = data.transaction_uuid;
    payment.rawInitiationResponse = paymentResponse;
    payment.rawVerificationResponse = data;
    payment.verifiedAt = new Date();

    payment.save();
    order.save();

    if (data.status === "COMPLETE") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/success/${order.id}`,
      );
    } else {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/failed/${order.id}`,
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to pay your order",
    });
  }
}
