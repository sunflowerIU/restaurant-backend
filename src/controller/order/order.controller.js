"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getOrders = getOrders;
exports.checkOrder = checkOrder;
exports.getOrderForPayment = getOrderForPayment;
const order_req_schema_1 = require("./order.req.schema");
const order_model_1 = require("../../model/order.model");
const product_model_1 = require("../../model/product.model");
const buildCheckoutFingerprint_1 = require("../../lib/buildCheckoutFingerprint");
const hash_1 = require("../../lib/hash");
const idempotency_mode_1 = require("../../model/idempotency.mode");
async function createOrder(req, res) {
    var _a, _b, _c;
    const idempotencyKey = req.header("Idempotency-Key");
    if (!idempotencyKey)
        return res.status(400).json({
            message: "idempotencyKey header is required",
        });
    try {
        const result = order_req_schema_1.orderSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0].message });
        }
        // console.log(result.data);
        //////now check idempotency and create if there no such order created
        //a. create fingerprint which means convert data into string with following details
        const fingerPrint = (0, buildCheckoutFingerprint_1.buildCheckoutFingerprint)({
            userId: (_a = result.data.userId) !== null && _a !== void 0 ? _a : null,
            phone: (_b = result.data.phone) !== null && _b !== void 0 ? _b : null,
            paymentMethod: result.data.paymentMethod,
            shippingAddress: result.data.shippingAddress,
            items: result.data.items,
        });
        //b.hash the fingerprint
        const requestHash = (0, hash_1.hashCheckoutFingerprint)(fingerPrint);
        //c. check if the idempotency key exists
        const existing = await idempotency_mode_1.Idempotencykey.findOne({
            key: idempotencyKey,
            route: "POST:/order/create",
        });
        //if that idempotency exists already
        if (existing) {
            if (existing.requestHash !== requestHash) {
                return res.status(409).json({
                    message: "This idempotency key was already used for different request",
                });
            }
            if (existing.status === "completed") {
                return res.status(existing.responseCode || 200).json({
                    message: "This idempotency key was already used for different request",
                });
            }
            if (existing.status === "processing") {
                return res.status(409).json({
                    message: "A matching checkout has been processed already.",
                });
            }
        }
        //otherwise create that idempotency
        await idempotency_mode_1.Idempotencykey.create({
            key: idempotencyKey,
            route: "POST:/order/create",
            requestHash,
            status: "processing",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        //1. first collect the requested productids
        const productsIds = result.data.items.map((item) => item.productId);
        //2. fetch available products from db
        const products = await product_model_1.Product.find({
            _id: { $in: productsIds },
            isAvailable: true,
        });
        // console.log(products);
        //3. ensure if item is unavailable then return error
        const currentlyAvailableItemsId = new Set(products.map((product) => product.id));
        const unavailableItems = productsIds.filter((id) => !currentlyAvailableItemsId.has(id));
        // console.log("unavailable", unavailableItems);
        if (unavailableItems.length > 0) {
            return res.status(400).json({
                message: "following items not available currently",
                data: unavailableItems,
            });
        }
        //4. make lookup map for fast access
        const productMap = new Map(products.map((product) => [product.id, product]));
        //5 final cartItems list from db
        const cartItems = result.data.items.map((item) => {
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
        });
        // console.log(cartItems);
        //find subtotal
        const subTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
        // console.log(subTotal);
        const shippingFee = +process.env.SHIPPING_FEE;
        const totalAmount = subTotal + shippingFee;
        ///create a product order
        const orderData = {
            userId: (_c = result.data.userId) !== null && _c !== void 0 ? _c : null,
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
        const order = await order_model_1.Order.create(orderData);
        const responseBody = order.paymentMethod === "cod"
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
        await idempotency_mode_1.Idempotencykey.findOneAndUpdate({
            key: idempotencyKey,
            route: "POST:/order/create",
        }, {
            $set: {
                status: "completed",
                responseCode: 201,
                responseBody,
                resourceType: "order",
                resourceId: order.id,
            },
        });
        return res.status(201).json(responseBody);
    }
    catch (error) {
        console.log(error);
        await idempotency_mode_1.Idempotencykey.findOneAndUpdate({
            key: idempotencyKey,
            route: "POST:/order/create",
        }, {
            $set: {
                status: "failed",
                responseCode: 500,
                responseBody: {
                    success: false,
                    message: error instanceof Error
                        ? error.message
                        : "Failed to create your order",
                },
            },
        });
        return res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to create your order",
        });
    }
}
async function getOrders(req, res) {
    console.log("order get");
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        //find orders
        const orders = await order_model_1.Order.find({ userId: req.user.id }).sort({
            createdAt: -1,
        });
        return res.status(200).json({ data: orders });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}
//check if certain order exists
async function checkOrder(req, res) {
    if (!req.params.id) {
        res.status(400).json({ message: "invalid order id" });
    }
    const orderId = req.params.id;
    if (!orderId)
        return res.status(400).json({ message: "invalid order id" });
    try {
        console.log(orderId);
        const order = await order_model_1.Order.findById(orderId.toString());
        if (!order) {
            return res.status(400).json({ message: "invalid order id" });
        }
        return res.status(200).json({ message: "order valid", data: order });
    }
    catch (error) {
        return res.status(500).json({
            message: error instanceof Error ? error.message : "internal server error",
        });
    }
}
///get that order detail for payment purpose. only return if order is pending
async function getOrderForPayment(req, res) {
    const { id } = req.params;
    console.log(id);
    if (!id)
        return res.status(400).json({ message: "no productId found" });
    try {
        const order = await order_model_1.Order.findById({ _id: id });
        if (!order ||
            order.orderStatus !== "pending" ||
            order.paymentMethod !== "prepaid" ||
            order.paymentStatus !== "pending")
            return res.status(404).json({ message: "order not found" });
        return res.status(200).json({ data: order });
    }
    catch (error) {
        return res.status(500).json({
            message: error instanceof Error ? error.message : "internal server error",
        });
    }
}
