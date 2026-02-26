import dotenv from "dotenv";
dotenv.config();

import app from "./app"; // Import the configured app from above
import mongoose from "mongoose";
import { generateQuestions } from "./services/hf.service";

const PORT = Number(process.env.PORT) || 5000;

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start listening
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Warmup AI Model after server is up
    (async () => {
      try {
        console.log("🔥 Warming AI model...");
        await generateQuestions("Test resume warmup");
        console.log("✅ AI warmup complete");
      } catch (err) {
        console.log("⚠ AI warmup failed (will retry on first request)");
      }
    })();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });