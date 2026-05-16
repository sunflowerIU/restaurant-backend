"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controller/payment/payment.controller");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
//initiate payment
router.post("/initiate", requireAuth_1.requireAuth, payment_controller_1.initiatePayment);
router.get("/esewa/:status/:paymentId", payment_controller_1.verifyPayment);
exports.default = router;
