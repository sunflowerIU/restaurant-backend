// biome-ignore assist/source/organizeImports:<>
import dotenv from "dotenv";
dotenv.config();
import http from "node:http";
import app from "./app";
import { connectToDB } from "./config/db";

const port = process.env.PORT || 5000;

async function startServer() {
  await connectToDB();

  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });
}

startServer().catch((error) => console.error(error));
