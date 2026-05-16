import { Request, Response } from "express";
import { orderSchema } from "./order.req.schema";
import { Order } from "../../model/order.model";
import { Product } from "../../model/product.model";
import { AuthenticatedRequest } from "../../lib/AuthenticatedRequest";
import { buildCheckoutFingerprint } from "../../lib/buildCheckoutFingerprint";
import { hashCheckoutFingerprint } from "../../lib/hash";
import { Idempotencykey } from "../../model/idempotency.mode";

export async function createOrder(req: Request, res: Response) {
  const idempotencyKey = req.header("Idempotency-Key");

  if (!idempotencyKey)
    return res.status(400).json({
      message: "idempotencyKey header is required",
    });

  try {
    const result = orderSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }
    // console.log(result.data);

    //////now check idempotency and create if there no such order created

    //a. create fingerprint which means convert data into string with following details
    const fingerPrint = buildCheckoutFingerprint({
      userId: result.data.userId ?? null,
      phone: result.data.phone ?? null,
      paymentMethod: result.data.paymentMethod,
      shippingAddress: result.data.shippingAddress,
      items: result.data.items,
    });

    //b.hash the fingerprint
    const requestHash = hashCheckoutFingerprint(fingerPrint);

    //c. check if the idempotency key exists
    const existing = await Idempotencykey.findOne({
      key: idempotencyKey,
      route: "POST:/order/create",
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

    //otherwise create that idempotency
    await Idempotencykey.create({
      key: idempotencyKey,
      route: "POST:/order/create",
      requestHash,
      status: "processing",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

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
      (item: {
        name: string;
        qty: number;
        productId: string;
        currency: string;
        imageSrc: string;
      }) => {
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

    ///create a product order
    const orderData = {
      userId: result.data.userId ?? null,
      customerName: result.data.fullName,
      shippingAddress: result.data.shippingAddress,
      phone: result.data.phone,
      items: cartItems,
      subTotal,
      shippingFee,
      totalAmount,
      paymentStatus: "pending",
      orderStatus: "pending",
      paymentMethod: result.data.paymentMethod,
    };
    const order = await Order.create(orderData);

    const responseBody =
      order.paymentMethod === "cod"
        ? {
            success: true,
            message: "order created successfully",
            orderId: order._id,
            paymentRequired: false,
            nextStep: "CONFIRMATION_PAGE",
            redirectUrl: `/orders/success/${order._id}`,
          }
        : {
            success: true,
            message: "order created successfully",
            orderId: order._id,
            paymentRequired: true,
            nextStep: "PAYMENT_REDIRECTION",
            redirectUrl: `/checkout/payment/${order._id}`,
          };

    //now if order is created then make idempotency status to completed
    await Idempotencykey.findOneAndUpdate(
      {
        key: idempotencyKey,
        route: "POST:/order/create",
      },
      {
        $set: {
          status: "completed",
          responseCode: 201,
          responseBody,
          resourceType: "order",
          resourceId: order.id,
        },
      },
    );

    return res.status(201).json(responseBody);
  } catch (error) {
    console.log(error);
    await Idempotencykey.findOneAndUpdate(
      {
        key: idempotencyKey,
        route: "POST:/order/create",
      },
      {
        $set: {
          status: "failed",
          responseCode: 500,
          responseBody: {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to create your order",
          },
        },
      },
    );
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to create your order",
    });
  }
}

export async function getOrders(req: AuthenticatedRequest, res: Response) {
  console.log("order get");
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    //find orders
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ data: orders });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

//check if certain order exists
export async function checkOrder(req: Request, res: Response) {
  if (!req.params.id) {
    res.status(400).json({ message: "invalid order id" });
  }
  const orderId = req.params.id as string;

  if (!orderId) return res.status(400).json({ message: "invalid order id" });

  try {
    console.log(orderId);
    const order = await Order.findById(orderId.toString());

    if (!order) {
      return res.status(400).json({ message: "invalid order id" });
    }
    return res.status(200).json({ message: "order valid", data: order });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "internal server error",
    });
  }
}

///get that order detail for payment purpose. only return if order is pending
export async function getOrderForPayment(req: Request, res: Response) {
  const { id } = req.params as { id: string };

  console.log(id);

  if (!id) return res.status(400).json({ message: "no productId found" });

  try {
    const order = await Order.findById({ _id: id });
    if (
      !order ||
      order.orderStatus !== "pending" ||
      order.paymentMethod !== "prepaid" ||
      order.paymentStatus !== "pending"
    )
      return res.status(404).json({ message: "order not found" });

    return res.status(200).json({ data: order });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "internal server error",
    });
  }
}
