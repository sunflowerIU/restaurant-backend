"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    //reference to category
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.Decimal128,
        required: true,
        // The getter converts the Decimal128 object to a string for the UI
        get: (v) => (v ? v.toString() : v),
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
}, {
    // Ensure getters run when converting to JSON or Objects
    toJSON: { getters: true },
    toObject: { getters: true },
});
exports.Product = mongoose_1.default.model("Product", productSchema);
