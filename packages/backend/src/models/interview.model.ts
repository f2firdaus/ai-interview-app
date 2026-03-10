import mongoose from "mongoose";

const questionDetailSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: "" },
  score: { type: Number, default: 0 },
  strength: { type: String, default: "" },
  improvement: { type: String, default: "" },
  betterAnswer: { type: String, default: "" },
  timeSpent: { type: Number, default: 0 }, // seconds spent on this question
}, { _id: false });

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ["upcoming", "completed"], default: "upcoming" },
  date: { type: Date, required: true },
  score: { type: Number },
  feedback: { type: String },
  questions: [questionDetailSchema],
  category: {
    type: String,
    enum: ["technical", "behavioral", "system-design", "hr", "general"],
    default: "general",
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  duration: { type: Number, default: 0 }, // total seconds
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Interview", schema);
