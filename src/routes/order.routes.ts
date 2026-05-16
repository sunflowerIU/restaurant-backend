import { Router } from "express";
import {
  checkOrder,
  createOrder,
  getOrderForPayment,
  getOrders,
} from "../controller/order/order.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/create", createOrder);
router.get("/get", requireAuth, getOrders);
router.get("/check/:id", checkOrder);

router.get("/get-for-payment/:id", getOrderForPayment);
export default router;
