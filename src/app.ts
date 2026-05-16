import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import productRouter from "./routes/product.routes";
import orderRouter from "./routes/order.routes";
import paymentRouter from "./routes/payment.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
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

//product route
app.use("/product", productRouter);

//order router
app.use("/order", orderRouter);

//payment router
app.use("/payment", paymentRouter);

export default app;
