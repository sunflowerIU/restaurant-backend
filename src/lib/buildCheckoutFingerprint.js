"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCheckoutFingerprint = buildCheckoutFingerprint;
function buildCheckoutFingerprint(input) {
    var _a, _b, _c;
    return JSON.stringify({
        userId: (_a = input.userId) !== null && _a !== void 0 ? _a : null,
        phone: (_b = input.phone) !== null && _b !== void 0 ? _b : null,
        paymentMethod: input.paymentMethod,
        shippingAddress: {
            label: input.shippingAddress.label,
            addressLine: input.shippingAddress.addressLine,
            city: input.shippingAddress.city,
            notes: (_c = input.shippingAddress.notes) !== null && _c !== void 0 ? _c : null,
        },
        items: [...input.items]
            .map((item) => ({
            productId: item.productId,
            qty: item.qty,
        }))
            .sort((a, b) => a.productId.localeCompare(b.productId)),
    });
}
