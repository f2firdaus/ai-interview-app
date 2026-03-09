import { Request, Response } from "express";
import * as auth from "./auth.service"; // updateUser, changePassword, getUserById

export const requestOtp = async (req: Request, res: Response) => {
  await auth.sendOtp(req.body.phone);
  res.json({ message: "OTP sent" });
};

export const loginOtp = async (req: Request, res: Response) => {
  const token = await auth.verifyOtp(
    req.body.phone,
    req.body.otp
  );
  res.json({ token });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const token = await auth.signupEmail(name, email, password);
    res.json({ token, message: "Account created" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const loginEmail = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const token = await auth.loginEmail(email, password);
    res.json({ token, message: "Logged in successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await auth.getUserById((req as any).user.id);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const { name } = req.body; // Email changes are not permitted for security reasons
    const user = await auth.updateUser((req as any).user.id, { name });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await auth.changePassword((req as any).user.id, currentPassword, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};