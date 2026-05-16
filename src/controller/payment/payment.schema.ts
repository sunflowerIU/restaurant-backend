import z from "zod";

const Gateway = z.enum(["esewa", "khalti"]);

const ItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.string(),
  qty: z.number(),
  imageSrc: z.string(),
});

export const PaymentInitiateSchema = z.object({
  gateway: Gateway,
  items: ItemSchema.array(),
  phone: z.string(),
  orderId: z.string(),
});
