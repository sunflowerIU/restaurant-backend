import { Router } from "express";
import {
  RegisterHandler,
  verifyEmail,
} from "../controller/auth/auth.controller";

const router = Router();

router.post("/register", RegisterHandler);
router.get("/verify-email", verifyEmail);

export default router;
