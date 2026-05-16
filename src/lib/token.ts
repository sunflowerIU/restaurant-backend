import jwt from "jsonwebtoken";

export function createAccessToken(
  userId: string,
  role: "user" | "admin",
  tokenVersion: number,
) {
  const payload = { sub: userId, role, tokenVersion };

  const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "10m",
  });

  return token;
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
    sub: string;
    role: string;
    tokenVersion: number;
  };
}

export function createRefreshToken(userId: string, tokenVersion: number) {
  const payload = { sub: userId, tokenVersion };

  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  return token;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
    sub: string;
    tokenVersion: number;
  };
}
