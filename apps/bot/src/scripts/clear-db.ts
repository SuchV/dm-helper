import mongoose from "mongoose";
import { botEnv } from "@spolka-z-l-o/env";

(async () => {
  try {
    await mongoose.connect(botEnv.MONGO_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    if (!db) {
      console.error(
        "No database connection found. Please check your MongoDB URI."
      );
      process.exit(1);
    }

    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }

    await mongoose.disconnect();
    console.log("Disconnected and cleared database.");
    process.exit(0);
  } catch (err) {
    console.error("Error clearing database:", err);
    process.exit(1);
  }
})();
