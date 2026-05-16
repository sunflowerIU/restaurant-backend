"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const token_1 = require("../lib/token");
const user_model_1 = require("../model/user.model");
async function requireAuth(req, res, next) {
    try {
        const token = req.header("authorization");
        // console.log(token);
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({ message: "invalid or expired token" });
        }
        const payload = (0, token_1.verifyAccessToken)(token.split(" ")[1]);
        if (!payload) {
            return res.status(401).json({ message: "invalid or expired token" });
        }
        const { sub: userId } = payload;
        //user
        const user = await user_model_1.User.findById(userId)
            .select("_id email isEmailVerified role name avatarSrc")
            .lean(); //Removes Mongoose Functionality: The returned object does not have methods like .save(), .update(), or setters/getters.
        if (!user) {
            return res.status(401).json({ message: "user not found" });
        }
        req.user = {
            email: user.email,
            id: user._id.toString(),
            isEmailVerified: user.isEmailVerified,
            role: user.role,
            // name: user.name,
            // addresses: user.addresses.map((address) => ({
            //   label: address.label ?? null,
            //   addressLine: address.addressLine ?? null,
            //   city: address.city ?? null,
            //   notes: address.notes ?? null,
            // })),
            // phone: user.phone,
            // avatarSrc: user.avatarSrc,
        };
        return next();
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Unauthorized" });
    }
}
