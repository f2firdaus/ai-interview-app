import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  phone: { type: String, unique: true, sparse: true },
  otp: String,
  otpExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", schema);

