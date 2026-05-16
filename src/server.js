"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// biome-ignore assist/source/organizeImports:<>
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const node_http_1 = __importDefault(require("node:http"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const port = process.env.PORT || 5000;
async function startServer() {
    await (0, db_1.connectToDB)();
    const server = node_http_1.default.createServer(app_1.default);
    server.listen(port, () => {
        console.log(`Server running at port ${port}`);
    });
}
startServer().catch((error) => console.error(error));
