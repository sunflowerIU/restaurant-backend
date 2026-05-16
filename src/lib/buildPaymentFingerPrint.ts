import { Address } from "./types";

type fingerPrintProps = {
  userId?: string | null;
  phone?: string | null;
  gateway: string;
  items: {
    productId: string;
    name: string;
    qty: number;
    imageSrc: string;
  }[];
};

export function buildPaymentFingerprint(input: fingerPrintProps) {
  return JSON.stringify({
    userId: input.userId ?? null,
    phone: input.phone ?? null,
    gateway: input.gateway,
    items: [...input.items]
      .map((item) => ({
        productId: item.productId,
        qty: item.qty,
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId)),
  });
}
