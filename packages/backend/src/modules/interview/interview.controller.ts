import { Request, Response } from "express";
import Interview from "../../models/interview.model";

export const createInterview = async (req: Request, res: Response) => {
  try {
    const { title, date } = req.body;
    // Mock user for now (auth skipped)
    const dummyUserId = "60b9c9c8a9f24250146f4949";

    const item = await Interview.create({
      userId: dummyUserId,
      title,
      date: new Date(date),
      status: "upcoming"
    });
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getInterviews = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const query = status ? { status } : {};

    const items = await Interview.find(query).sort({ date: -1 });
    res.json(items);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getInterviewById = async (req: Request, res: Response) => {
  try {
    const item = await Interview.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Interview not found" });
    }
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const completeInterview = async (req: Request, res: Response) => {
  try {
    const { score, feedback, questions } = req.body;

    const item = await Interview.findByIdAndUpdate(
      req.params.id,
      {
        status: "completed",
        score,
        feedback,
        questions: questions || [],
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: "Interview not found" });
    }

    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const completed = await Interview.find({ status: "completed" });
    const upcoming = await Interview.find({ status: "upcoming" }).sort({ date: 1 });

    const totalCompleted = completed.length;
    const totalUpcoming = upcoming.length;

    // Calculate average score
    const scores = completed
      .map((i) => i.score)
      .filter((s): s is number => s !== null && s !== undefined);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Next upcoming session
    const nextSession = upcoming.length > 0 ? upcoming[0] : null;

    // Sessions this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const sessionsThisWeek = await Interview.countDocuments({
      date: { $gte: startOfWeek, $lt: endOfWeek },
    });

    res.json({
      avgScore,
      totalCompleted,
      totalUpcoming,
      sessionsThisWeek,
      nextSession,
      recentUpcoming: upcoming.slice(0, 3),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteInterview = async (req: Request, res: Response) => {
  try {
    const item = await Interview.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Interview not found" });
    }
    res.json({ message: "Interview deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Quick practice: create an interview and immediately return it (no resume needed)
export const quickPractice = async (_req: Request, res: Response) => {
  try {
    const dummyUserId = "60b9c9c8a9f24250146f4949";
    const item = await Interview.create({
      userId: dummyUserId,
      title: "Quick Practice",
      date: new Date(),
      status: "upcoming",
    });
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
