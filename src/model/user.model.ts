import { Schema, SchemaType, model } from "mongoose";
import {
  normalizeNepalPhone,
  isValidNepalMobile,
} from "../lib/phoneNormalizer";
import { Address } from "../lib/AuthenticatedRequest";

export const addressSchema = new Schema({
  label: String,
  addressLine: String,
  city: String,
  notes: {
    type: String,
    default: null,
  },
});

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      //initialization vector
      iv: { type: String },

      //real secret value
      content: { type: String },

      //this helps to check if encrypted data above is modified by hacker.
      tag: { type: String },
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
    avatarSrc: {
      type: String,
      default: undefined,
    },
    addresses: {
      type: [addressSchema],
      validate: [validateAddresses, "maximum 2 address is allowed"],
    },
    phone: {
      type: String,
      default: undefined,
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
  },
  {
    timestamps: true,
    // _id: false, //prevents unnecessary id for subdocuments like in 2fa secrets.
  },
);

//pre saving model
userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as
    | { phone?: string; $set?: { phone?: string } }
    | undefined;

  if (!update) return;

  if (update.phone) {
    update.phone = normalizeNepalPhone(update.phone);
  }

  if (update.$set?.phone) {
    update.$set.phone = normalizeNepalPhone(update.$set.phone);
  }

  this.setUpdate(update);
});

function validateAddresses(val: Array<Address>) {
  return val.length <= 2;
}

export const User = model("User", userSchema);
