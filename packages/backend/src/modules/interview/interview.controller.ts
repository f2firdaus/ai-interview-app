import { Request, Response } from "express";
import Interview from "../../models/interview.model";

const VALID_STATUSES = ["upcoming", "completed"];
const VALID_CATEGORIES = ["technical", "behavioral", "system-design", "hr", "general"];
const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

export const createInterview = async (req: Request, res: Response) => {
  try {
    const { title, date, category, difficulty } = req.body;
    const userId = (req as any).user.id;

    if (!title || typeof title !== "string" || title.trim().length < 2) {
      return res.status(400).json({ error: "Title is required (min 2 chars)" });
    }
    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: "Valid date is required" });
    }

    const item = await Interview.create({
      userId,
      title: title.trim().slice(0, 100),
      date: new Date(date),
      status: "upcoming",
      category: VALID_CATEGORIES.includes(category) ? category : "general",
      difficulty: VALID_DIFFICULTIES.includes(difficulty) ? difficulty : "medium",
    });
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getInterviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const status = req.query.status as string;
    const query: any = { userId };

    // Whitelist status values to prevent injection
    if (status && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

    const items = await Interview.find(query).sort({ date: -1 }).limit(50);
    res.json(items);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getInterviewById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const item = await Interview.findOne({ _id: req.params.id, userId });
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
    const userId = (req as any).user.id;
    const { score, feedback, questions, duration } = req.body;

    // Validate score
    if (score !== undefined && (typeof score !== "number" || score < 0 || score > 10)) {
      return res.status(400).json({ error: "Score must be between 0 and 10" });
    }

    const item = await Interview.findOneAndUpdate(
      { _id: req.params.id, userId },
      {
        status: "completed",
        score: typeof score === "number" ? Math.round(score * 10) / 10 : 0,
        feedback: typeof feedback === "string" ? feedback.slice(0, 2000) : "",
        questions: Array.isArray(questions) ? questions.slice(0, 20) : [],
        duration: typeof duration === "number" ? Math.round(duration) : 0,
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

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const completed = await Interview.find({ status: "completed", userId }).sort({ date: -1 });
    const upcoming = await Interview.find({ status: "upcoming", userId }).sort({ date: 1 });

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
      userId,
      date: { $gte: startOfWeek, $lt: endOfWeek },
    });

    // --- ANALYTICS ---

    // Score trend (last 10 interviews, oldest first)
    const scoreTrend = completed.slice(0, 10).reverse().map((i) => ({
      date: i.date,
      score: i.score || 0,
      title: i.title,
    }));

    // Category breakdown (avg score per category)
    const categoryMap: Record<string, { total: number; count: number }> = {};
    completed.forEach((i) => {
      const cat = (i as any).category || "general";
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
      categoryMap[cat].total += i.score || 0;
      categoryMap[cat].count += 1;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([cat, v]) => ({
      category: cat,
      avgScore: Math.round(v.total / v.count * 10) / 10,
      count: v.count,
    })).sort((a, b) => a.avgScore - b.avgScore); // Weakest first

    // Practice streak (consecutive days with at least 1 interview)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const hasInterview = completed.some(
        (interview) => {
          const d = new Date(interview.date);
          return d >= dayStart && d < dayEnd;
        }
      );
      if (hasInterview) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({
      avgScore,
      totalCompleted,
      totalUpcoming,
      sessionsThisWeek,
      nextSession,
      recentUpcoming: upcoming.slice(0, 3),
      // Analytics
      scoreTrend,
      categoryBreakdown,
      streak,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteInterview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const item = await Interview.findOneAndDelete({ _id: req.params.id, userId });
    if (!item) {
      return res.status(404).json({ error: "Interview not found" });
    }
    res.json({ message: "Interview deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Quick practice: create an interview and immediately return it (no resume needed)
export const quickPractice = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const item = await Interview.create({
      userId,
      title: "Quick Practice",
      date: new Date(),
      status: "upcoming",
    });
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
