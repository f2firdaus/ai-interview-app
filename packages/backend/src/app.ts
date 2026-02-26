import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes";
import resumeRoutes from "./modules/resume/resume.routes";
import aiRoutes from "./modules/ai/ai.routes"; // Ensure this path is correct
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Body Parsers with high limits for audio files
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use('/api/ai', aiRoutes);
// router.post("/transcribe", ...); // Add this
// Global Error Handler
app.use(errorHandler);

export default app; // Export the configured app