// backend/src/modules/ai/ai.routes.ts

import { Router } from "express";
import multer from "multer";
import { transcribeAudio, evaluate } from "./ai.controller";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Transcribe audio to text
router.post("/transcribe", upload.single("audio"), transcribeAudio);

// Evaluate answer
router.post("/evaluate", evaluate);

export default router;