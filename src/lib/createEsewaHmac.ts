import crypto from "crypto";
export function createEsewaHmac(input: string) {
  return crypto
    .createHmac("sha256", process.env.ESEWA_SECRET_KEY!)
    .update(input)
    .digest("base64");
}
