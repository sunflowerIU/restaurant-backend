"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.createNewAddress = createNewAddress;
exports.removeAddress = removeAddress;
const user_model_1 = require("../../model/user.model");
const mongoose_1 = require("mongoose");
async function getUser(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "unauthorized" });
    }
    // console.log(req.user);
    return res.status(200).json({ user: req.user });
}
async function updateUser(req, res) {
    // console.log(req.body);
    // console.log(req.user);
    if (!req.body.name)
        return;
    if (!req.user)
        return;
    try {
        const user = await user_model_1.User.findByIdAndUpdate(req.user.id, {
            phone: req.body.phone,
            name: req.body.name,
        }, { new: true, runValidators: true });
        if (!user) {
            return res.status(401).json({
                message: "User not found",
            });
        }
        return res.status(200).json({ message: "user updated." });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error instanceof mongoose_1.MongooseError ? error.message : "Error updating user",
        });
    }
}
async function createNewAddress(req, res) {
    const { label, addressLine, city, notes } = req.body;
    if (!label || !addressLine || !city) {
        return res.status(400).json({ message: "PLease fill up all the details" });
    }
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    //find user
    const user = await user_model_1.User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }
    if (user.addresses.length >= 2) {
        return res.status(400).json({ message: "maximum 2 address allowed" });
    }
    user.addresses.unshift({ label, addressLine, city, notes });
    await user.save();
    return res
        .status(200)
        .json({ message: "address updated", addresses: user.addresses });
}
async function removeAddress(req, res) {
    const { addressId } = req.body;
    if (!addressId) {
        return res.status(400).json({ message: "Address id required" });
    }
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await user_model_1.User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    //remove address
    const addressToBeRemoved = user.addresses.id(addressId);
    if (!addressToBeRemoved) {
        return res.status(404).json({ message: "incorrect address" });
    }
    addressToBeRemoved.deleteOne();
    await user.save();
    return res.status(200).json({
        message: "Address removed",
        addresses: user.addresses,
    });
}
