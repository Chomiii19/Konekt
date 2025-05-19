import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import Circle from "../models/circleModel";
import { ICircleMember } from "../@types/interfaces";
import AppError from "../utils/appError";

const createCircle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, members } = req.body;

    const circleMembers: ICircleMember[] = [
      { user_id: req.user._id, role: "admin" },
      ...members,
    ];
    const circle = await Circle.create({
      name,
      created_by: req.user.username,
      members: circleMembers,
    });

    res.status(201).json({ status: "Success", data: circle });
  }
);

const getUserCircles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    const circles = await Circle.find({
      members: {
        $elemMatch: {
          user_id: userId,
          role: { $ne: "pending" },
          approved_by_owner: true,
        },
      },
    });

    if (circles.length === 0)
      return res.status(200).json({
        status: "Success",
        message: "You haven't joined any circles yet.",
      });

    res.status(200).json({ status: "Success", data: circles });
  }
);

const getPendingCircles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    const circles = await Circle.find({
      members: {
        $elemMatch: {
          user_id: userId,
          role: "pending",
        },
      },
    });

    if (circles.length === 0)
      return res.status(200).json({
        status: "Success",
        message: "You have no pending circles.",
      });

    res.status(200).json({ status: "Success", data: circles });
  }
);

const acceptPendingCircle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const circleId = req.params.id;
    const userId = req.user._id;

    const circle = await Circle.findOneAndUpdate(
      {
        _id: circleId,
        members: { $elemMatch: { user_id: userId, role: "pending" } },
      },
      {
        $set: {
          "members.$[elem].role": "member",
        },
      },
      { new: true, arrayFilters: [{ "elem.user_id": userId }] }
    );

    if (!circle) return next(new AppError("Circle doesn't exist", 404));

    res.status(200).json({
      status: "Success",
      message: "You are now a member of this circle.",
    });
  }
);

const inviteMemberToCircle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { memberId } = req.body;
    const circleId = req.params.id;

    const circle = await Circle.findByIdAndUpdate(
      circleId,
      {
        $push: {
          members: {
            user_id: memberId,
            role: "pending",
          },
        },
      },
      { new: true }
    );

    if (!circle) {
      return next(new AppError("Circle not found", 404));
    }

    res.status(200).json({
      status: "Success",
      message: "Member invited successfully.",
      data: circle,
    });
  }
);

const removeMemberFromCircle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { memberId } = req.body;
    const circleId = req.params.id;
    const userId = req.user._id;

    const circle = await Circle.findById(circleId);

    if (!circle) {
      return next(new AppError("Circle not found", 404));
    }

    const currentMember = circle.members.find(
      (member) => member.user_id.toString() === userId.toString()
    );

    if (!currentMember || currentMember.role !== "admin") {
      return next(new AppError("Only admins can perform this action", 403));
    }

    const isMember = circle.members.some(
      (member) => member.user_id.toString() === memberId.toString()
    );

    if (!isMember) {
      return next(new AppError("User is not a member of the circle", 400));
    }

    circle.members = circle.members.filter(
      (member) => member.user_id.toString() !== memberId.toString()
    );

    await circle.save();

    res.status(200).json({
      status: "Success",
      message: "Member removed successfully.",
      data: circle,
    });
  }
);

const approveMemberToCircle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const deleteCircle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getCircleOwner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getCircleAdmins = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export {
  createCircle,
  getUserCircles,
  getPendingCircles,
  acceptPendingCircle,
  inviteMemberToCircle,
  removeMemberFromCircle,
  approveMemberToCircle,
  deleteCircle,
  getCircleOwner,
};
