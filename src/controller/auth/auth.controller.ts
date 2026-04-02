import type { Request, Response } from "express";
import { RegisterSchema } from "./auth.schema";
import { User } from "../../model/user.model";
import { hashPassword } from "../../lib/hash";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../lib/email";

//register new user
export async function RegisterHandler(req: Request, res: Response) {
  try {
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
