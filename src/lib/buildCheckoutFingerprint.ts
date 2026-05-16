import { Address } from "./types";

type fingerPrintProps = {
  userId?: string | null;
  phone?: string | null;
  paymentMethod: string;
  shippingAddress: Address;
  items: {
    productId: string;
    name: string;
    qty: number;
    currency: string;
  }[];
};

export function buildCheckoutFingerprint(input: fingerPrintProps) {
  return JSON.stringify({
    userId: input.userId ?? null,
    phone: input.phone ?? null,
    paymentMethod: input.paymentMethod,
    shippingAddress: {
      label: input.shippingAddress.label,
      addressLine: input.shippingAddress.addressLine,
      city: input.shippingAddress.city,
      notes: input.shippingAddress.notes ?? null,
    },
    items: [...input.items]
      .map((item) => ({
        productId: item.productId,
        qty: item.qty,
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId)),
  });
}
