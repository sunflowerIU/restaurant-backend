import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    rawVerificationResponse: {
      //raw response from payment gateway after payment done
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Payment = mongoose.model("Payment", paymentSchema);
