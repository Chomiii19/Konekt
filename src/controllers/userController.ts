import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import User from "../models/userModel";

const locationSharing = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { enableLocationSharing } = req.body;

    if (typeof enableLocationSharing !== "boolean") {
      return next(new AppError("Invalid value for enableLocationSharing", 400));
    }

    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return next(new AppError("User not found", 404));

    user.location_sharing_enabled = enableLocationSharing;
    await user.save();

    res.status(200).json({
      status: "Success",
      data: {
        location_sharing_enabled: user.location_sharing_enabled,
      },
    });
  }
);

const updateCurrentLocation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export { locationSharing, updateCurrentLocation };
