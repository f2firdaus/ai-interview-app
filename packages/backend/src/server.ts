import dotenv from "dotenv";
dotenv.config();

import app from "./app"; // Import the configured app from above
import mongoose from "mongoose";
const PORT = Number(process.env.PORT) || 5000;

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start listening
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("🤖 AI powered by Groq (Llama 3.3 70B)");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });