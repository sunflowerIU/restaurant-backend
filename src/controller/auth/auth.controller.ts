import crypto from "crypto";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../../lib/AuthenticatedRequest";
import { sendEmail } from "../../lib/email";
import { hashPassword, verifyPassword } from "../../lib/hash";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../../lib/token";
import { User } from "../../model/user.model";
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "./auth.schema";

//register new user
export async function RegisterHandler(req: Request, res: Response) {
  try {
    console.log(req.body);
    const result = RegisterSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "This email has been used already." });
    }

    //hashing password
    const hashedPassword = await hashPassword(password);

    //create user in db
    const newUser = await User.create({
      email: normalizedEmail,
      passwordHash: hashedPassword,
      name,
      role: "user",
      isEmailVerified: false,
      twoFactorEnabled: false,
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "1d",
    });

    const verifyUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    //create email and send email
    await sendEmail(
      newUser.email,
      "Verify your account",
      `<p>click on the link below to verify your email.</p>

      <a href='${verifyUrl}'>${verifyUrl}</a>
      `,
    );

    //return now
    return res.status(200).json({
      message: "User created successfully. Please verify your email.",
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error });
  }
}

//verify email
export async function verifyEmail(req: Request, res: Response) {
  try {
    const token = req.query.token as string | undefined;

    if (!token) {
      return res.status(400).json({ message: "No token available." });
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      id: string;
    };
    console.log(payload);

    //find user with the id
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(404).json({ message: "user not found." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "email verified already." });
    }

    user.isEmailVerified = true;
    await user.save();

    return res.status(200).json({
      message: "Your email has been verified successfully. You can login now.",
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "invalid token",
    });
  }
}

//login
export async function loginHandler(req: Request, res: Response) {
  try {
    const result = LoginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { email, password } = result.data;
    const normalisedEmail = email.toLowerCase().trim();

    //find user
    const user = await User.findOne({ email: normalisedEmail });

    if (!user) {
      return res.status(200).json({
        message: "We will send you an email if your email is registered to us.",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        message: "please verify your email first.",
      });
    }

    //verify password
    const passwordCorrect = await verifyPassword(user.passwordHash, password);

    if (!passwordCorrect) {
      return res.status(400).json({
        message: "Incorrect email or password.",
      });
    }

    //create access token
    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );

    //create refresh token
    const refreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
}

//refresh tokens after it gets expired
export async function refreshHandler(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;

    if (!token) {
      return res.status(401).json({
        message: "invalid refresh token",
      });
    }

    const payload = verifyRefreshToken(token);

    if (!payload) {
      return res.status(401).json({
        message: "invalid refresh token",
      });
    }

    const { sub, tokenVersion } = payload;

    const user = await User.findById(sub);

    if (!user) {
      return res.status(401).json({
        message: "user not found",
      });
    }

    if (user.tokenVersion !== tokenVersion) {
      res.clearCookie("refreshToken", {
        path: "/",
      });
      return res.status(401).json({
        message: "You have been logged out. Please login again.",
      });
    }

    //create new token
    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );

    //refresh token
    const refreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "token refresh successful",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        addresses: user.addresses,
        phone: user.phone,
        avatarSrc: user.avatarSrc,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
}

//user clicks on forgot password
export async function forgotPasswordHandler(req: Request, res: Response) {
  try {
    const result = ForgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }
    const normalisedEmail = result.data.email.toLowerCase().trim();

    //user
    const user = await User.findOne({ email: normalisedEmail });

    if (!user) {
      return res.status(200).json({
        message: "We will send you an email if your email is registered to us",
      });
    }

    //create email
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const link = `${process.env.FRONTEND_URL}/auth/reset-password?token=${rawToken}`;

    await sendEmail(
      user.email,
      "Reset Password",
      `
      <p>Please click on link below to reset your password:</p> 

      <p>
        <a href='${link}'>${link}</a>
      </p>
      `,
    );
    return res.json({
      message:
        "We will send you password reset link on your email if you're registered with us.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
}

//token verifier only
export async function resetPasswordTokenVerifier(req: Request, res: Response) {
  try {
    const token = req.query?.token as string;
    if (!token) {
      return res.status(400).json({
        message: "invalid token",
      });
    }
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        message: "token invalid or expired",
      });
    }

    return res.status(200).json({
      message: "token is valid",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
}

//verify that email
export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    // console.log(req.body);
    const result = ResetPasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { token, password } = result.data;

    if (!token) {
      return res.status(400).json({
        message: "token invalid or expired",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        message: "token invalid or expired",
      });
    }

    const newPasswordHash = await hashPassword(password);

    user.passwordHash = newPasswordHash;
    user.tokenVersion++;
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password has been updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
}

export async function logoutHandler(_req: Request, res: Response) {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.status(200).json({
    message: "User logged out successfully",
  });
}

//update password
export async function updatePassword(req: AuthenticatedRequest, res: Response) {
  console.log(req.body);
  const { newPassword, oldPassword } = req.body as {
    newPassword: string | undefined;
    oldPassword: string | undefined;
  };
  if (!newPassword || !oldPassword) {
    return res
      .status(400)
      .json({ message: "old and new password is required" });
  }

  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //verify password
    const result = await verifyPassword(user.passwordHash, oldPassword);

    if (!result) {
      return res.status(400).json({
        message: "incorrect password",
      });
    }

    //hash new password
    const newPasswordHash = await hashPassword(newPassword);

    user.passwordHash = newPasswordHash;
    user.tokenVersion++;
    await user.save();

    //refresh token
    const refreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({ message: "password updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
}
