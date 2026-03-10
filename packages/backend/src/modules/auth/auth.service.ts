import User from "../../models/user.model";
import Interview from "../../models/interview.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const isStrongPassword = (pass: string) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(pass);
};

export const signupEmail = async (name: string, email: string, password: string) => {
  if (!name || !email || !password) throw new Error("All fields are required");
  if (!isStrongPassword(password)) {
    throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.");
  }

  const exist = await User.findOne({ email });
  if (exist) throw new Error("Email already in use");

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
  if (!user) throw new Error("Invalid credentials");

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

export const updateUser = async (id: string, data: { name?: string }) => {
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

export const resetPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) return; // Silently return — don't reveal if email exists

  // Generate a temporary password
  const tempPw = Math.random().toString(36).slice(-10) + "A1!";
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(tempPw, salt);
  await user.save();

  // In production, send this via email. For now, log it:
  console.log(`🔑 Password reset for ${email}: ${tempPw}`);
};

export const deleteAccount = async (id: string, password: string) => {
  const user = await User.findById(id);
  if (!user || !user.password) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Password is incorrect");

  // Delete all user interviews
  await Interview.deleteMany({ userId: id });
  // Delete user account
  await User.findByIdAndDelete(id);
};