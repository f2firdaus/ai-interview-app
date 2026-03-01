import { Request, Response } from "express";
import Interview from "../../models/interview.model";

export const createInterview = async (req: Request, res: Response) => {
  try {
    const { title, date } = req.body;
    // Mock user for now if missing token auth middleware
    const dummyUserId = "60b9c9c8a9f24250146f4949"; // placeholder object id
    
    // In strict env, we use req.user.id
    
    const item = await Interview.create({
      userId: dummyUserId, // hardcoded for demo simplicity since we lack strict auth middleware
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
    const status = req.query.status as string; // upcoming | completed
    const query = status ? { status } : {};
    
    const items = await Interview.find(query).sort({ date: 1 });
    res.json(items);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
