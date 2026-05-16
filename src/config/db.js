"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDB = connectToDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectToDB() {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URL);
        console.log("Mongodb connected successfully.");
    }
    catch (error) {
        console.error("MongoDb connection error: ", error);
        process.exit(1);
    }
}
