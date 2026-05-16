"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentInitiateSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const Gateway = zod_1.default.enum(["esewa", "khalti"]);
const ItemSchema = zod_1.default.object({
    productId: zod_1.default.string(),
    name: zod_1.default.string(),
    price: zod_1.default.string(),
    qty: zod_1.default.number(),
    imageSrc: zod_1.default.string(),
});
exports.PaymentInitiateSchema = zod_1.default.object({
    gateway: Gateway,
    items: ItemSchema.array(),
    phone: zod_1.default.string(),
    orderId: zod_1.default.string(),
});
