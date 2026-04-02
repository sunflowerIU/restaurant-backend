import mongoose from "mongoose";

export async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log("Mongodb connected successfully.");
  } catch (error) {
    console.error("MongoDb connection error: ", error);
    process.exit(1);
  }
}
