import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export default globalErrorHandler;
