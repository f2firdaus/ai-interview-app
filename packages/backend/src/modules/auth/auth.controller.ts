import { Request, Response } from "express";
import * as auth from "./auth.service";

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
    const { name } = req.body;
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

// Forgot password: reset with email (generates a temporary password for now)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    await auth.resetPassword(email);
    res.json({ message: "If that email exists, a reset has been processed. Use the temporary password sent to login." });
  } catch (err: any) {
    // Always return success to prevent email enumeration
    res.json({ message: "If that email exists, a reset has been processed." });
  }
};

// Delete account permanently
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required to confirm deletion" });
    await auth.deleteAccount((req as any).user.id, password);
    res.json({ message: "Account deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};