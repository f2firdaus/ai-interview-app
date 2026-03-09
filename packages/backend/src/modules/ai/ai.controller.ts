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
    // Read the uploaded audio file directly
    const audioBuffer = fs.readFileSync(filePath);
    const originalName = req.file?.originalname || "audio.m4a";
    const mimeType = req.file?.mimetype || "audio/m4a";

    console.log(`🎤 Audio received: name=${originalName}, mime=${mimeType}, size=${audioBuffer.length} bytes`);

    // Try content types in order of preference, prioritizing the actual uploaded file's mimetype
    const contentTypesToTry = [mimeType, "audio/amr", "audio/wav", "audio/m4a", "audio/webm", "audio/mpeg"];

    let lastError = "";
    for (const contentType of contentTypesToTry) {
      try {
        console.log(`🔄 Trying transcription with Content-Type: ${contentType}...`);

        const response = await fetch(
          "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": contentType,
            },
            body: audioBuffer,
          }
        );

        if (response.ok) {
          const result = await response.json() as { text?: string };
          const fullText = result.text?.trim() || "";
          console.log("✅ Transcription result:", fullText);
          return res.json({ success: true, text: fullText });
        }

        const errText = await response.text();
        lastError = errText;

        // If it's a format error, try next content type
        if (response.status === 400) {
          console.log(`⚠️ ${contentType} rejected, trying next...`);
          continue;
        }

        // For other errors (auth, rate limit), don't retry
        console.error("HF Whisper API error:", response.status, errText);
        throw new Error(`HF API returned ${response.status}: ${errText}`);
      } catch (fetchErr: any) {
        if (fetchErr.message?.includes("HF API returned")) throw fetchErr;
        lastError = fetchErr.message;
        console.log(`⚠️ Fetch error with ${contentType}:`, fetchErr.message);
      }
    }

    throw new Error(`All content types failed. Last error: ${lastError}`);

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