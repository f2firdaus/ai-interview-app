import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { transcribeAudio, evaluate } from "./ai.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Protect all AI routes with authentication
router.use(authenticate);

// Rate limit AI routes: 30 requests per 15 minutes per user
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: "Too many AI requests. Please wait before trying again." },
    standardHeaders: true,
    legacyHeaders: false,
});

// File upload config with size + type guards
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max audio
    fileFilter: (_req, file, cb) => {
        const allowed = ["audio/wav", "audio/m4a", "audio/amr", "audio/webm", "audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac", "application/octet-stream"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported audio format: ${file.mimetype}`));
        }
    },
});

// Transcribe audio to text
router.post("/transcribe", aiLimiter, upload.single("audio"), transcribeAudio);

// Evaluate answer
router.post("/evaluate", aiLimiter, evaluate);

export default router;