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