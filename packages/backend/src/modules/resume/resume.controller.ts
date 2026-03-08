import { Request, Response } from "express";
import pdfParse from "pdf-parse";
import { generateQuestions } from "../../services/hf.service";

export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "PDF file required",
      });
    }

    // Extract text
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    console.log("📄 Resume text length:", resumeText.length);

    // Call AI
    const aiRaw = await generateQuestions(resumeText);

    console.log("🤖 AI raw:", aiRaw);

    let questions: string[] = [];

    // ✅ If AI returned JSON string → parse
    if (typeof aiRaw === "string") {
      try {
        const parsed = JSON.parse(aiRaw);
        questions = parsed?.questions || [];
      } catch {
        // fallback — treat raw text as one question
        questions = [aiRaw];
      }
    }

    // ✅ If AI returned object
    if (typeof aiRaw === "object" && aiRaw !== null) {
      questions = (aiRaw as any).questions || [];
    }

    // Sanitize: ensure all questions are proper strings
    questions = questions
      .map((q: any) => typeof q === "string" ? q.trim() : "")
      .filter((q: string) => q.length > 10 && !/^[\{\}\[\],:"]+$/.test(q));

    questions = questions.slice(0, 5);
    return res.status(200).json({
      success: true,
      questions,
    });

  } catch (error: any) {
    console.error("❌ Resume processing error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to process resume",
    });
  }
};
