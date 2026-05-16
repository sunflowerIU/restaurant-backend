"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaymentFingerprint = buildPaymentFingerprint;
function buildPaymentFingerprint(input) {
    var _a, _b;
    return JSON.stringify({
        userId: (_a = input.userId) !== null && _a !== void 0 ? _a : null,
        phone: (_b = input.phone) !== null && _b !== void 0 ? _b : null,
        gateway: input.gateway,
        items: [...input.items]
            .map((item) => ({
            productId: item.productId,
            qty: item.qty,
        }))
            .sort((a, b) => a.productId.localeCompare(b.productId)),
    });
}
