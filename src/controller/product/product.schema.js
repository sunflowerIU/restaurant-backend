"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategorySchema = exports.CreateProductSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const priceSchema = zod_1.default.preprocess((val) => {
    // 1. Convert input to a number if it's a string
    const parsed = parseFloat(String(val));
    // 2. If it's not a number, let Zod handle the error
    if (Number.isNaN(parsed))
        return val;
    // 3. Force 2 decimal places (111 -> "111.00", 111.87 -> "111.87")
    return parsed.toFixed(2);
}, zod_1.default.string().refine((val) => parseFloat(val) > 0, {
    message: "Price must be greater than 0",
}));
exports.CreateProductSchema = zod_1.default.object({
    name: zod_1.default.string().min(1, "Name is required"),
    price: priceSchema,
    categoryId: zod_1.default.string().min(1, "category is required"),
    imageSrc: zod_1.default.string(),
    isAvailable: zod_1.default.coerce.boolean().default(true),
    timeToMake: zod_1.default.number(),
});
exports.CreateCategorySchema = zod_1.default.object({
    name: zod_1.default.string().min(1, "Category is required").toLowerCase(),
    isActive: zod_1.default.boolean().optional(),
});
