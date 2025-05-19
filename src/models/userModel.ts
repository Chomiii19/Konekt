import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../@types/interfaces";

const LocationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "high",
    },
    last_updated_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EmergencySchema = new mongoose.Schema(
  {
    sos_enabled: { type: Boolean, default: false },
    sos_message: { type: String, default: "Help me! Here's my location." },
    contacts: [{ type: String }],
  },
  { _id: false }
);

const LocationVisibilityScheduleSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    from: { type: String },
    to: { type: String },
  },
  { _id: false }
);

const SettingsSchema = new mongoose.Schema(
  {
    notifications_enabled: { type: Boolean, default: true },
    language_preference: { type: String, default: "eng" },
    battery_saver_mode: { type: Boolean, default: false },
    location_visibility_schedule: LocationVisibilityScheduleSchema,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: 5,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
  profile_picture_url: { type: String },
  created_at: {
    type: Date,
    default: Date.now,
  },
  last_active_at: {
    type: Date,
    default: Date.now,
  },

  location: LocationSchema,
  location_sharing_enabled: { type: Boolean, default: false },

  circle_ids: [{ type: Schema.Types.ObjectId, ref: "Circle" }],
  shared_with_user_ids: [{ type: Schema.Types.ObjectId, ref: "User" }],
  blocked_user_ids: [{ type: Schema.Types.ObjectId, ref: "User" }],

  emergency: EmergencySchema,
  settings: SettingsSchema,
});

userSchema.pre("save", async function (this, next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>("Users", userSchema);

export default User;
