import cookieParser from "cookie-parser";
import express from "express";
import cors, { CorsOptions } from "cors";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import productRouter from "./routes/product.routes";
import orderRouter from "./routes/order.routes";
import paymentRouter from "./routes/payment.routes";

const app = express();

const whitelist = [
  "http://localhost:3000",
  "https://restaurant-backend-j0st.onrender.com",
];
const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    // !origin handles server-to-server or tools like Postman/cURL
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
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
