import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { evaluateAnswer } from "../../services/hf.service";

export const evaluate = async (req: Request, res: Response) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: "Question and answer Required"
      });
    }

    const result = await evaluateAnswer(question, answer);
    return res.json({
      success: true,
      feedback: result
    });
  } catch (err) {
    console.error("Evaluation Error:", err);
    return res.status(500).json({
      success: false,
      error: "Evaluation failed"
    });
  }
};

export const transcribeAudio = async (req: Request, res: Response) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({ error: "No audio file received" });
  }

  try {
    // Read the uploaded audio file directly (no ffmpeg conversion needed)
    const audioBuffer = fs.readFileSync(filePath);
    const originalName = req.file?.originalname || "audio.m4a";

    // Detect content type from the file extension
    const ext = path.extname(originalName).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".m4a": "audio/mp4",
      ".mp4": "audio/mp4",
      ".wav": "audio/wav",
      ".webm": "audio/webm",
      ".ogg": "audio/ogg",
      ".flac": "audio/flac",
      ".mp3": "audio/mpeg",
    };
    const contentType = contentTypeMap[ext] || "audio/mp4";

    console.log(`🎤 Transcribing audio (${contentType}, ${audioBuffer.length} bytes) via HuggingFace Whisper API...`);

    // Direct fetch to HuggingFace Inference API — Whisper accepts m4a/mp4/wav/webm natively
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": contentType,
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("HF Whisper API error:", response.status, errText);
      throw new Error(`HF API returned ${response.status}: ${errText}`);
    }

    const result = await response.json() as { text?: string };
    const fullText = result.text?.trim() || "";
    console.log("✅ Transcription result:", fullText);

    res.json({ success: true, text: fullText });

  } catch (error) {
    console.error("Transcription Error:", error);
    res.status(500).json({ success: false, error: "Transcription failed" });
  } finally {
    // 🧹 Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.log("🧹 Temp audio file deleted");
  }
};