import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

//health check
app.get("/health", (_req, res) => {
  res.status(200).json({ message: "ok" });
});

//auth route
app.use("/auth", authRouter);

//user route
app.use("/user", userRouter);

export default app;
