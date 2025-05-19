import mongoose, { Schema } from "mongoose";
import { IFriend } from "../@types/interfaces";

const friendSchema = new mongoose.Schema({
  requester: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted"],
    default: "pending",
  },
  share_location: {
    requester_to_recipient: { type: Boolean, default: false },
    recipient_to_requester: { type: Boolean, default: false },
  },
});

const Friend = mongoose.model<IFriend>("Friend", friendSchema);

export default Friend;
