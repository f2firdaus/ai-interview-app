import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  console.error(err);
  res.status(500).json({
    error: err.message || "Server error"
  });
};