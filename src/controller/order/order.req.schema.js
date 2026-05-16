"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderSchema = void 0;
const z = __importStar(require("zod"));
const orderItemSchema = z.object({
    name: z.string().min(2),
    qty: z.number().min(1),
    productId: z.string(),
    currency: z.string(),
    imageSrc: z.string(),
});
const shippingAddressSchema = z.object({
    label: z.string().min(2, "label is required"),
    addressLine: z.string().min(2, "address is required"),
    city: z.string().min(2, "city is required"),
    notes: z.string().optional(),
});
const paymentType = z.enum(["prepaid", "cod"], {
    error: () => ({ message: "Invalid payment type" }),
});
// const userIdType = z.enum([null, z.string]);
exports.orderSchema = z.object({
    userId: z.string().nullable(),
    items: z.array(orderItemSchema).min(1, "your cart cannot be empty"),
    shippingAddress: shippingAddressSchema,
    paymentMethod: paymentType,
    phone: z.string().min(10).max(10),
    fullName: z.string(),
});
