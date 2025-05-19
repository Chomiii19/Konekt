import mongoose, { Schema } from "mongoose";
import { ICircle } from "../@types/interfaces";

const CircleMemberSchema = new mongoose.Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
  },
  { _id: false }
);

const CircleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [CircleMemberSchema],
  created_at: { type: Date, default: Date.now },
});

const Circle = mongoose.model<ICircle>("Circle", CircleSchema);
module.exports = Circle;
