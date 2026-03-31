import User from "../../models/user.model";
import Interview from "../../models/interview.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const isStrongPassword = (pass: string) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(pass);
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const createMailTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Password reset email is not configured on the server.");
  }

  if (EMAIL_HOST) {
    return nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT ? Number(EMAIL_PORT) : 587,
      secure: EMAIL_SECURE === "true",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

export const signupEmail = async (name: string, email: string, password: string) => {
  if (!name || !email || !password) throw new Error("All fields are required");
  if (!isStrongPassword(password)) {
    throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.");
  }

  const cleanEmail = normalizeEmail(email);
  const exist = await User.findOne({ email: new RegExp("^" + cleanEmail + "$", "i") });
  if (exist) throw new Error("Email already in use");

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email: cleanEmail, password: hashedPassword });

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(
    { id: user._id, email: cleanEmail },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const loginEmail = async (email: string, password: string) => {
  const cleanEmail = normalizeEmail(email);
  const user = await User.findOne({ email: new RegExp("^" + cleanEmail + "$", "i") });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password || "");
  if (!isMatch) throw new Error("Invalid credentials");

  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(
    { id: user._id, email: user.email },
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
  const cleanEmail = normalizeEmail(email);
  const user = await User.findOne({ email: new RegExp("^" + cleanEmail + "$", "i") });
  if (!user) return;

  const tempPw = Math.random().toString(36).slice(-6).toUpperCase();

  try {
    const transporter = createMailTransporter();
    await transporter.verify();

    await transporter.sendMail({
      from: `"HireAI Support" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Your New Password for HireAI",
      text: `Hello,

Your password has been successfully reset.

Here is your new temporary login password: ${tempPw}

Please log in using this password. Make sure to change your password immediately from your Profile Settings once logged in.

Best,
The HireAI Team`,
    });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(tempPw, salt);
    await user.save();
    console.log(`Password reset email successfully sent to: ${cleanEmail}`);
  } catch (error) {
    console.error(`Failed to send password reset email to ${cleanEmail}:`, error);
    throw new Error("We could not send the reset email right now. Please try again later.");
  }
};

export const deleteAccount = async (id: string, password: string) => {
  const user = await User.findById(id);
  if (!user || !user.password) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Password is incorrect");

  await Interview.deleteMany({ userId: id });
  await User.findByIdAndDelete(id);
};
