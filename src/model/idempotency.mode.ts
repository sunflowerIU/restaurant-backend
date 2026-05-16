import mongoose, { Schema } from "mongoose";

const idempotencySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    route: {
      type: String,
      required: true,
    },
    requestHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
    },
    responseCode: {
      type: Number,
      default: null,
    },
    requestBody: {
      type: Schema.Types.Mixed,
      default: null,
    },
    resourceType: {
      type: String,
      default: null,
    },
    resourceId: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, //deletes this document when the current time reaches to the time mentioned above
    },
  },
  {
    timestamps: true,
  },
);

export const Idempotencykey = mongoose.model(
  "IdempotencyKey",
  idempotencySchema,
);
