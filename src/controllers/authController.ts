import { NextFunction, Request, Response } from "express";
import catchASync from "../utils/catchAsync";
import AppError from "../utils/appError";
import User from "../models/userModel";
import { IUser } from "../@types/interfaces";
import signToken from "../utils/signToken";
import sendEmailVerification from "../utils/sendCodeVerification";
import generateCode from "../utils/generateCode";

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: "Success",
    token,
  });
};

const login = catchASync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError("Invalid empty fields", 400));

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password)))
      return next(new AppError("Invalid credentials. Please try again.", 400));

    user.verificationCode = generateCode();
    await user.save();

    sendEmailVerification(user);
    createSendToken(user, 200, res);
  }
);

const signup = catchASync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, username, email, password, phoneNumber } = req.body;

    if (!fullName || !username || !email || !password || !phoneNumber)
      return next(new AppError("Invalid empty fields", 400));

    const user = await User.create({
      fullName,
      username,
      email,
      password,
      phoneNumber,
      verificationCode: generateCode(),
    });

    sendEmailVerification(user);
    createSendToken(user, 201, res);
  }
);

const verify = catchASync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const logout = catchASync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export { login, signup, verify, logout };
