"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.hashCheckoutFingerprint = hashCheckoutFingerprint;
const argon2_1 = __importDefault(require("argon2"));
const crypto_1 = __importDefault(require("crypto"));
async function hashPassword(password) {
    return argon2_1.default.hash(password, {
        type: argon2_1.default.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 1,
    });
}
async function verifyPassword(hashedPassword, plainPassword) {
    return argon2_1.default.verify(hashedPassword, plainPassword);
}
function hashCheckoutFingerprint(input) {
    return crypto_1.default.createHash("sha256").update(input).digest("hex");
}
