import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    //reference to category
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    imageSrc: {
      type: String,
      required: true,
    },
    price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,

      // The getter converts the Decimal128 object to a string for the UI
      get: (v: mongoose.Schema.Types.Decimal128) => (v ? v.toString() : v),
    },
    currency: {
      type: String,
      default: "Rs",
    },
    timeToMake: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Ensure getters run when converting to JSON or Objects
    toJSON: { getters: true },
    toObject: { getters: true },
  },
);

export const Product = mongoose.model("Product", productSchema);
