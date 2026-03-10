import { Request, Response } from "express";
import pdfParse from "pdf-parse";
import { generateQuestions } from "../../services/hf.service";
import User from "../../models/user.model";

export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "PDF file required" });
    }

    const userId = (req as any).user.id;

    // Extract text
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    console.log("📄 Resume text length:", resumeText.length);

    // Save resume text to user profile for future use
    await User.findByIdAndUpdate(userId, {
      resumeText: resumeText.slice(0, 10000), // Cap at 10k chars
      resumeFileName: req.file.originalname || "resume.pdf",
      resumeUploadedAt: new Date(),
    });

    // Call AI
    const aiRaw = await generateQuestions(resumeText);
    console.log("🤖 AI raw:", aiRaw);

    let questions: string[] = [];

    if (typeof aiRaw === "string") {
      try {
        const parsed = JSON.parse(aiRaw);
        questions = parsed?.questions || [];
      } catch {
        questions = [aiRaw];
      }
    }

    if (typeof aiRaw === "object" && aiRaw !== null) {
      questions = (aiRaw as any).questions || [];
    }

    questions = questions
      .map((q: any) => typeof q === "string" ? q.trim() : "")
      .filter((q: string) => q.length > 10 && !/^[\{\}\[\],:\"]+$/.test(q));

    questions = questions.slice(0, 5);
    return res.status(200).json({ success: true, questions });

  } catch (error: any) {
    console.error("❌ Resume processing error:", error);
    return res.status(500).json({ success: false, error: "Failed to process resume" });
  }
};

// Use saved resume (no re-upload needed)
export const useSavedResume = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId);

    if (!user?.resumeText) {
      return res.status(404).json({ success: false, error: "No saved resume found. Please upload one first." });
    }

    const aiRaw = await generateQuestions(user.resumeText);
    let questions: string[] = [];

    if (typeof aiRaw === "string") {
      try { questions = JSON.parse(aiRaw)?.questions || []; } catch { questions = [aiRaw]; }
    }
    if (typeof aiRaw === "object" && aiRaw !== null) {
      questions = (aiRaw as any).questions || [];
    }

    questions = questions
      .map((q: any) => typeof q === "string" ? q.trim() : "")
      .filter((q: string) => q.length > 10 && !/^[\{\}\[\],:\"]+$/.test(q))
      .slice(0, 5);

    return res.json({ success: true, questions, resumeFileName: user.resumeFileName });
  } catch (error: any) {
    console.error("❌ Saved resume error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate questions" });
  }
};

// Get resume info (check if user has a saved resume)
export const getResumeInfo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("resumeFileName resumeUploadedAt");
    res.json({
      hasSavedResume: !!user?.resumeFileName,
      fileName: user?.resumeFileName || null,
      uploadedAt: user?.resumeUploadedAt || null,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
