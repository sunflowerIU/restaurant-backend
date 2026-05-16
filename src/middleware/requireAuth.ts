import type { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../lib/AuthenticatedRequest";
import { verifyAccessToken } from "../lib/token";
import { User } from "../model/user.model";

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.header("authorization");
    // console.log(token);
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "invalid or expired token" });
    }

    const payload = verifyAccessToken(token.split(" ")[1]);

    if (!payload) {
      return res.status(401).json({ message: "invalid or expired token" });
    }

    const { sub: userId } = payload;

    //user
    const user = await User.findById(userId)
      .select("_id email isEmailVerified role name avatarSrc")
      .lean(); //Removes Mongoose Functionality: The returned object does not have methods like .save(), .update(), or setters/getters.
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    req.user = {
      email: user.email,
      id: user._id.toString(),
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      // name: user.name,
      // addresses: user.addresses.map((address) => ({
      //   label: address.label ?? null,
      //   addressLine: address.addressLine ?? null,
      //   city: address.city ?? null,
      //   notes: address.notes ?? null,
      // })),
      // phone: user.phone,
      // avatarSrc: user.avatarSrc,
    };

    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
