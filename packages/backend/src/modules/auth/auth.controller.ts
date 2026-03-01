import { Request, Response } from "express";
import * as auth from "./auth.service";

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