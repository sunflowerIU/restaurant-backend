"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const phoneNormalizer_1 = require("../lib/phoneNormalizer");
const user_model_1 = require("./user.model");
const mongoose_2 = require("mongoose");
const OrderItemSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: true,
        get: (v) => (v ? v.toString() : v),
    },
    qty: {
        required: true,
        type: Number,
    },
    imageSrc: String,
}, {
    // Ensure getters run when converting to JSON or Objects
    toJSON: { getters: true },
    toObject: { getters: true },
    _id: false,
});
const orderSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    customerName: { type: String },
    shippingAddress: { type: user_model_1.addressSchema, required: true },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                if (!value)
                    return true; // optional field
                const normalized = (0, phoneNormalizer_1.normalizeNepalPhone)(value);
                return (0, phoneNormalizer_1.isValidNepalMobile)(normalized);
            },
            message: "Invalid Nepal phone number",
        },
    },
    items: {
        type: [OrderItemSchema],
        required: true,
    },
    subTotal: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: true,
        get: (v) => (v ? v.toString() : v),
    },
    shippingFee: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: true,
        get: (v) => (v ? v.toString() : v),
    },
    discount: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: mongoose_1.Schema.Types.Decimal128,
        required: true,
        get: (v) => (v ? v.toString() : v),
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    },
    orderStatus: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "preparing",
            "shipped",
            "delivered",
            "cancelled",
        ],
        default: "pending",
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "prepaid"],
        required: true,
    },
    paymentId: {
        type: String,
    },
}, { toJSON: { getters: true }, toObject: { getters: true }, timestamps: true });
exports.Order = (0, mongoose_2.model)("Order", orderSchema);
