import User from "../../models/user.model";
import { sendSMS } from "../../services/sms.service";
import jwt from "jsonwebtoken";

export const sendOtp = async (phone: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  await User.findOneAndUpdate(
    { phone },
    { otp, otpExpiry: expiry },
    { upsert: true }
  );

  await sendSMS(phone, `Your OTP: ${otp}`);
};

export const verifyOtp = async (phone: string, otp: string) => {
  const user = await User.findOne({ phone });

  if (!user || user.otp !== otp || user.otpExpiry! < new Date())
    throw new Error("Invalid OTP");

  return jwt.sign(
    { id: user._id, phone },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "7d" }
  );
};

export const signupEmail = async (name: string, email: string, password: string) => {
  const exist = await User.findOne({ email });
  if (exist) throw new Error("Email already in use");

  const user = await User.create({ name, email, password });
  return jwt.sign(
    { id: user._id, email },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "7d" }
  );
};

export const loginEmail = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user || user.password !== password) throw new Error("Invalid credentials");

  return jwt.sign(
    { id: user._id, email },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: "7d" }
  );
};