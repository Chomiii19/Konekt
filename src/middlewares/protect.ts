import { NextFunction, Response, Request } from "express";
import catchAsync from "../utils/catchAsync";
import User from "../models/userModel";
import AppError from "../utils/appError";
import verifyToken from "../utils/verifyToken";

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return next(new AppError("No user token found. Please log in.", 404));

    const decodedToken = verifyToken(token);
    const user = await User.findById(decodedToken);

    if (!user)
      return next(
        new AppError("User belonging to this userID does not exist", 404)
      );

    req.user = user;
    next();
  }
);

export default protect;
