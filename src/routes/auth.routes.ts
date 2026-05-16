import { Router } from "express";
import {
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  RegisterHandler,
  resetPasswordHandler,
  resetPasswordTokenVerifier,
  updatePassword,
  verifyEmail,
} from "../controller/auth/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
import {
  googleAuthCallbackHandler,
  googleAuthStartHandler,
} from "../controller/auth/google.auth";
import { AuthenticatedRequest } from "../lib/AuthenticatedRequest";

const router = Router();

router.post("/register", RegisterHandler);
router.get("/verify-email", verifyEmail);
router.post("/login", loginHandler);
router.get("/refresh", refreshHandler);
router.post("/logout", logoutHandler);

//updating password
router.post("/update-password", requireAuth, updatePassword);

//3 stage of resetting password.
router.post("/forgot-password", forgotPasswordHandler);
router.get("/token-verifier", resetPasswordTokenVerifier);
router.post("/reset-password", resetPasswordHandler);

//google auth
router.get("/google", googleAuthStartHandler);
router.get("/google/callback", googleAuthCallbackHandler);

//require auth
router.get("/admin", requireAuth, (req: AuthenticatedRequest, res) =>
  res.status(200).json({ user: req.user }),
);
export default router;
