import mongoose from "mongoose";

const schema = new mongoose.Schema({
  phone: { type: String, unique: true },
  otp: String,
  otpExpiry: Date
});

export default mongoose.model("User", schema);

