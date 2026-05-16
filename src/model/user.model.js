"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.addressSchema = void 0;
const mongoose_1 = require("mongoose");
const phoneNormalizer_1 = require("../lib/phoneNormalizer");
exports.addressSchema = new mongoose_1.Schema({
    label: String,
    addressLine: String,
    city: String,
    notes: {
        type: String,
        default: null,
    },
});
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        required: true,
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        //initialization vector
        iv: { type: String },
        //real secret value
        content: { type: String },
        //this helps to check if encrypted data above is modified by hacker.
        tag: { type: String },
    },
    tokenVersion: {
        type: Number,
        default: 0,
    },
    resetPasswordToken: {
        type: String,
        default: undefined,
    },
    resetPasswordExpires: {
        type: Date,
        default: undefined,
    },
    avatarSrc: {
        type: String,
        default: undefined,
    },
    addresses: {
        type: [exports.addressSchema],
        validate: [validateAddresses, "maximum 2 address is allowed"],
    },
    phone: {
        type: String,
        default: undefined,
        trim: true,
        validate: {
            validator: (value) => {
                if (!value)
                    return true; // optional field
                const normalized = (0, phoneNormalizer_1.normalizeNepalPhone)(value);
                return (0, phoneNormalizer_1.isValidNepalMobile)(normalized);
            },
            message: "Invalid Nepal phone number",
        },
    },
}, {
    timestamps: true,
    // _id: false, //prevents unnecessary id for subdocuments like in 2fa secrets.
});
//pre saving model
userSchema.pre("findOneAndUpdate", async function () {
    var _a;
    const update = this.getUpdate();
    if (!update)
        return;
    if (update.phone) {
        update.phone = (0, phoneNormalizer_1.normalizeNepalPhone)(update.phone);
    }
    if ((_a = update.$set) === null || _a === void 0 ? void 0 : _a.phone) {
        update.$set.phone = (0, phoneNormalizer_1.normalizeNepalPhone)(update.$set.phone);
    }
    this.setUpdate(update);
});
function validateAddresses(val) {
    return val.length <= 2;
}
exports.User = (0, mongoose_1.model)("User", userSchema);
