import { Request, Response } from 'express';
import fs from 'fs';
import { execSync } from 'child_process';
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
  let wavPath = "";

  if (!filePath) {
    return res.status(400).json({ error: "No audio file received" });
  }

  try {
    // Convert to WAV using ffmpeg (HF Whisper API needs a recognizable format)
    wavPath = filePath + ".wav";
    console.log("🔄 Converting audio to WAV...");
    execSync(`ffmpeg -y -i "${filePath}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}"`, {
      stdio: 'pipe'
    });

    // Read the converted WAV file
    const audioBuffer = fs.readFileSync(wavPath);

    console.log("🎤 Transcribing audio via HuggingFace Whisper API...");

    // Direct fetch to HuggingFace Inference API
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "audio/wav",
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
    // 🧹 Clean up both files
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (wavPath && fs.existsSync(wavPath)) {
      fs.unlinkSync(wavPath);
    }
    console.log("🧹 Temp audio files deleted");
  }
};