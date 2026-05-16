import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    // name?: string | null;
    role: "user" | "admin";
    isEmailVerified: boolean;
    // addresses?: Address[];
    // phone?: string | null;
    avatarSrc?: string | null;
  };
}

export type Address = {
  label?: string | null;
  addressLine?: string | null;
  city?: string | null;
  notes?: string | null;
};
