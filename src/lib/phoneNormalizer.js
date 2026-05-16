"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeNepalPhone = normalizeNepalPhone;
exports.isValidNepalMobile = isValidNepalMobile;
function normalizeNepalPhone(phone) {
    const cleaned = phone.replace(/[\s-]/g, "");
    if (cleaned.startsWith("+977")) {
        return cleaned.slice(4);
    }
    if (cleaned.startsWith("977")) {
        return cleaned.slice(3);
    }
    return cleaned;
}
function isValidNepalMobile(phone) {
    return /^9[678]\d{8}$/.test(phone);
}
