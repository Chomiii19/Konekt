import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import User from "../models/userModel";
import { Socket } from "socket.io";
import Friend from "../models/friendModel";

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

// Getting location from updateUserLocation
const updateCurrentLocation = (socket: Socket) => {
  socket.on("updateUserLocation", async (data) => {
    const { userId, lat, lng } = data;

    if (socket.user.id !== userId) return;

    const user = await User.findById(userId);

    if (!user) return;

    user.location.latitude = lat;
    user.location.longitude = lng;
    user.location.last_updated_at = new Date();

    await user.save();

    getFriendsLocation(socket);
  });
};

const findFriends = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const searchTerm = req.query.q as string;

    if (!searchTerm || searchTerm.trim() === "")
      return res.status(400).json({ message: "Search query is required" });

    const regex = new RegExp(searchTerm, "i");

    const friends = await Friend.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    });

    const excludedIds = new Set([req.user._id.toString()]);
    friends.forEach((f) => {
      excludedIds.add(f.requester.toString());
      excludedIds.add(f.recipient.toString());
    });

    const matchedUsers = await User.find({
      username: regex,
      _id: { $nin: Array.from(excludedIds) },
    })
      .limit(10)
      .select("username name profilePicture");

    res.status(200).json(matchedUsers);
  }
);

const getAllFriends = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = req.user._id.toString();

    const friends = await Friend.find({
      status: "accepted",
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    })
      .populate("requester recipient", "username name profile_picture_url")
      .lean();

    const friendList = friends.map((friend) => {
      // @ts-ignore
      const requesterId = friend.requester._id.toString();

      const userFriend =
        currentUser === requesterId ? friend.recipient : friend.requester;

      return {
        _id: friend._id.toString(),
        ...userFriend,
      };
    });

    res.status(200).json({ status: "Success", data: friendList });
  }
);

const addFriend = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { recipient } = req.body;

    await Friend.create({
      requester: req.user._id,
      recipient,
    });

    res.status(201).json({ status: "Success" });
  }
);

const getAllPendingRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user._id;

    const pendingRequests = await Friend.find({
      recipient: user,
      status: "pending",
    })
      .select("requester")
      .populate("requester", "username name profile_picture_url");

    if (pendingRequests.length === 0)
      return res
        .status(200)
        .json({ status: "Success", message: "No pending friend requests" });

    res.status(200).json({ status: "Success", data: pendingRequests });
  }
);

const acceptFriendRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;

    const friendRequest = await Friend.findOneAndUpdate(
      { _id: id, recipient: userId, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    if (!friendRequest) {
      return next(
        new AppError("Friend request not found or unauthorized", 404)
      );
    }

    res.status(200).json({
      status: "Success",
      data: friendRequest,
    });
  }
);

const deleteFriend = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;

    const friendRequest = await Friend.findOneAndDelete({
      _id: id,
      $or: [{ requester: userId }, { recipient: userId }],
    });

    if (!friendRequest) {
      return next(
        new AppError("Friend request not found or unauthorized", 404)
      );
    }

    res.status(200).json({
      status: "Success",
      message: "Friend succesfully removed.",
    });
  }
);

const updateFriendLocationSharing = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const friend = await Friend.findOne({ _id: id });

    if (!friend) {
      return next(new AppError("Friend relationship not found", 404));
    }

    if (friend.requester.toString() === userId) {
      friend.share_location.requester_to_recipient = true;
    } else if (friend.recipient.toString() === userId) {
      friend.share_location.recipient_to_requester = true;
    } else {
      return next(new AppError("Unauthorized to update this friend", 403));
    }

    await friend.save();

    res.status(200).json({
      status: "Success",
      data: friend,
    });
  }
);

const getFriendsLocation = async (socket: Socket) => {
  const userId = socket.user.id;

  const friends = await Friend.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }],
  });

  const allowedFriendIds: string[] = [];

  friends.forEach((friend) => {
    if (
      friend.requester === userId &&
      friend.share_location.recipient_to_requester
    )
      allowedFriendIds.push(friend.recipient.toString());

    if (
      friend.recipient === userId &&
      friend.share_location.requester_to_recipient
    )
      allowedFriendIds.push(friend.requester.toString());
  });

  if (allowedFriendIds.length === 0) {
    socket.emit("friends:locations", []);
    return;
  }

  const friendsData = await User.find(
    { _id: { $in: allowedFriendIds } },
    "username name profile_picture_url location"
  );

  socket.emit("friends:locations", friendsData);
};

export {
  locationSharing,
  updateCurrentLocation,
  findFriends,
  getAllFriends,
  addFriend,
  getAllPendingRequests,
  acceptFriendRequest,
  deleteFriend,
  updateFriendLocationSharing,
  getFriendsLocation,
};
