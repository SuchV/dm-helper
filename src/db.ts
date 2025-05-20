// src/database.ts
import mongoose from "mongoose";
import env from "./helpers/env";

export async function connectToDatabase() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}
