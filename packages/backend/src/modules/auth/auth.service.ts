import User from "../../models/user.model";
import { sendSMS } from "../../services/sms.service";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(
    { id: user._id, phone },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const isStrongPassword = (pass: string) => {
  // Requires at least 8 characters, 1 uppercase, 1 lowercase, and 1 number
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(pass);
};

export const signupEmail = async (name: string, email: string, password: string) => {
  if (!isStrongPassword(password)) {
    throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.");
  }

  const exist = await User.findOne({ email });
  if (exist) throw new Error("Email already in use");

  // Encrypt the password using an industry-standard heavy salt (12 rounds)
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword });

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(
    { id: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const loginEmail = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  // Always return identical error messages for failed logins to prevent email enumeration
  if (!user) throw new Error("Invalid credentials");

  // Compare the submitted plain-text password with the stored encrypted hash
  const isMatch = await bcrypt.compare(password, user.password || "");
  if (!isMatch) throw new Error("Invalid credentials");

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(
    { id: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const getUserById = async (id: string) => {
  return User.findById(id).select("-password -otp -otpExpiry");
};

export const updateUser = async (id: string, data: { name?: string; email?: string }) => {
  if (data.email) {
    const existing = await User.findOne({ email: data.email, _id: { $ne: id } });
    if (existing) throw new Error("Email is already in use by another account");
  }
  return User.findByIdAndUpdate(id, { $set: data }, { new: true }).select("-password -otp -otpExpiry");
};

export const changePassword = async (id: string, currentPassword: string, newPassword: string) => {
  const user = await User.findById(id);
  if (!user || !user.password) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  if (!isStrongPassword(newPassword)) {
    throw new Error("Password must be at least 8 characters with uppercase, lowercase, and a number.");
  }

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
};