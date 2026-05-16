import { Schema } from "mongoose";
import {
  normalizeNepalPhone,
  isValidNepalMobile,
} from "../lib/phoneNormalizer";
import { addressSchema } from "./user.model";
import { model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    price: {
      type: Schema.Types.Decimal128,
      required: true,
      get: (v: Schema.Types.Decimal128) => (v ? v.toString() : v),
    },

    qty: {
      required: true,
      type: Number,
    },
    imageSrc: String,
  },
  {
    // Ensure getters run when converting to JSON or Objects
    toJSON: { getters: true },
    toObject: { getters: true },
    _id: false,
  },
);

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: { type: String },
    shippingAddress: { type: addressSchema, required: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => {
          if (!value) return true; // optional field

          const normalized = normalizeNepalPhone(value);
          return isValidNepalMobile(normalized);
        },
        message: "Invalid Nepal phone number",
      },
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    subTotal: {
      type: Schema.Types.Decimal128,
      required: true,
      get: (v: Schema.Types.Decimal128) => (v ? v.toString() : v),
    },
    shippingFee: {
      type: Schema.Types.Decimal128,
      required: true,
      get: (v: Schema.Types.Decimal128) => (v ? v.toString() : v),
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Schema.Types.Decimal128,
      required: true,
      get: (v: Schema.Types.Decimal128) => (v ? v.toString() : v),
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
  },
  { toJSON: { getters: true }, toObject: { getters: true }, timestamps: true },
);

export const Order = model("Order", orderSchema);
