import { Router } from "express";
import {
  initiatePayment,
  verifyPayment,
} from "../controller/payment/payment.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

//initiate payment
router.post("/initiate", requireAuth, initiatePayment);

router.get("/esewa/:status/:paymentId", requireAuth, verifyPayment);

export default router;
