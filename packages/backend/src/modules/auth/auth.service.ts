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
    { phone },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};