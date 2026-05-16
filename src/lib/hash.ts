import argon2 from "argon2";
import crypto from "crypto";

export async function hashPassword(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(
  hashedPassword: string,
  plainPassword: string,
): Promise<boolean> {
  return argon2.verify(hashedPassword, plainPassword);
}

export function hashCheckoutFingerprint(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}
