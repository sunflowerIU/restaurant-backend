import * as z from "zod";

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

export const orderSchema = z.object({
  userId: z.string().nullable(),
  items: z.array(orderItemSchema).min(1, "your cart cannot be empty"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: paymentType,
  phone: z.string().min(10).max(10),
  fullName: z.string(),
});
