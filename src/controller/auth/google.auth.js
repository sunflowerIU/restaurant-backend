"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthStartHandler = googleAuthStartHandler;
exports.googleAuthCallbackHandler = googleAuthCallbackHandler;
const google_auth_library_1 = require("google-auth-library");
const user_model_1 = require("../../model/user.model");
const crypto_1 = __importDefault(require("crypto"));
const hash_1 = require("../../lib/hash");
const token_1 = require("../../lib/token");
function getGoogleClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId || !clientSecret) {
        throw new Error("Googel client id and secret both are missing");
    }
    return new google_auth_library_1.OAuth2Client({
        clientId,
        clientSecret,
        redirectUri,
    });
}
//google start handler to redirect client to the google login page
async function googleAuthStartHandler(req, res) {
    console.log("fone");
    try {
        const client = getGoogleClient();
        const url = client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: ["openid", "email", "profile"],
        });
        res.redirect(url);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
async function googleAuthCallbackHandler(req, res) {
    const code = req.query.code;
    if (!code) {
        return res.status(200).json({ message: "missing google callback code" });
    }
    try {
        const client = getGoogleClient();
        const { tokens } = await client.getToken(code);
        if (!tokens.id_token) {
            return res.status(400).json({
                message: "google id token missing",
            });
        }
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload === null || payload === void 0 ? void 0 : payload.email;
        const isEmailVerified = payload === null || payload === void 0 ? void 0 : payload.email_verified;
        const name = payload === null || payload === void 0 ? void 0 : payload.name;
        if (!email || !isEmailVerified) {
            return res.status(400).json({
                message: "no google id_token was present",
            });
        }
        const normalisedEmail = email.toLowerCase().trim();
        let user = await user_model_1.User.findOne({
            email: normalisedEmail,
        });
        if (!user) {
            const randomPassword = crypto_1.default.randomBytes(16).toString("hex");
            const passwordHash = await (0, hash_1.hashPassword)(randomPassword);
            user = await user_model_1.User.create({
                email: normalisedEmail,
                role: "user",
                isEmailVerified: true,
                twoFactorEnabled: false,
                passwordHash,
                name,
            });
        }
        else {
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                await user.save();
            }
        }
        const accessToken = (0, token_1.createAccessToken)(user.id, user.role, user.tokenVersion);
        const refreshToken = (0, token_1.createRefreshToken)(user.id, user.tokenVersion);
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });
        res.redirect(`${process.env.FRONTEND_URL}`);
        return res.json({
            message: "Google login successful.",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                isEmailVerified: user.isEmailVerified,
                twoFactorEnabled: user.twoFactorEnabled,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({
            message: "Google auth failed",
        });
    }
}
