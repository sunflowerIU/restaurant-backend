"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth/auth.controller");
const requireAuth_1 = require("../middleware/requireAuth");
const google_auth_1 = require("../controller/auth/google.auth");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.RegisterHandler);
router.get("/verify-email", auth_controller_1.verifyEmail);
router.post("/login", auth_controller_1.loginHandler);
router.get("/refresh", auth_controller_1.refreshHandler);
router.post("/logout", auth_controller_1.logoutHandler);
//updating password
router.post("/update-password", requireAuth_1.requireAuth, auth_controller_1.updatePassword);
//3 stage of resetting password.
router.post("/forgot-password", auth_controller_1.forgotPasswordHandler);
router.get("/token-verifier", auth_controller_1.resetPasswordTokenVerifier);
router.post("/reset-password", auth_controller_1.resetPasswordHandler);
//google auth
router.get("/google", google_auth_1.googleAuthStartHandler);
router.get("/google/callback", google_auth_1.googleAuthCallbackHandler);
//require auth
router.get("/admin", requireAuth_1.requireAuth, (req, res) => res.status(200).json({ user: req.user }));
exports.default = router;
