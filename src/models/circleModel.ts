import mongoose, { Schema } from "mongoose";
import { ICircle } from "../@types/interfaces";

const CircleMemberSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["admin", "member", "pending"],
      default: "pending",
    },
    approved_by_owner: {
      type: Boolean,
      default: false,
    },
    enable_location_sharing: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const CircleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  created_by: { type: String, required: true },
  members: [CircleMemberSchema],
  created_at: { type: Date, default: Date.now },
});

const Circle = mongoose.model<ICircle>("Circle", CircleSchema);

export default Circle;
