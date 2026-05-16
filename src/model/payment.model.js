"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    orderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
    },
    phone: {
        type: String,
        default: null,
    },
    gateway: {
        type: String,
        enum: ["khalti", "esewa"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["initiated", "pending", "paid", "failed", "expired", "refunded"],
        default: "initiated",
    },
    gatewayTransactionId: {
        type: String,
        default: null,
    },
    gatewayReferenceId: {
        type: String,
        default: null,
    },
    idempotencyKey: {
        type: String,
        default: null,
    },
    rawInitiationResponse: {
        //raw response from payment gateway after payment initiation
        type: mongoose_1.default.Schema.Types.Mixed,
        default: null,
    },
    rawVerificationResponse: {
        //raw response from payment gateway after payment done
        type: mongoose_1.default.Schema.Types.Mixed,
        default: null,
    },
    verifiedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
exports.Payment = mongoose_1.default.model("Payment", paymentSchema);
