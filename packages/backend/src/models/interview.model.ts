import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ["upcoming", "completed"], default: "upcoming" },
  date: { type: Date, required: true },
  score: { type: Number },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Interview", schema);
