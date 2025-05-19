import { Schema } from "mongoose";

interface ILocation {
  latitude: number;
  longitude: number;
  accuracy: string;
  last_updated_at: Date;
}

interface IEmergency {
  sos_enabled: boolean;
  sos_message: boolean;
  contacts: string[];
}

interface ILocationVisibilitySchedule {
  enabled: boolean;
  from: string;
  to: string;
}

interface ISettings {
  notifications_enabled: boolean;
  language_preference: string;
  battery_saver_mode: boolean;
  location_visibility_schedule: ILocationVisibilitySchedule;
}

interface IUser {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  isVerified: boolean;
  verificationCode: string;
  password: string;
  phoneNumber: string;
  profile_picture_url: string;
  createdAt: Date;
  lastActiveAt: Date;

  location: ILocation;
  location_sharing_enabled: boolean;

  circle_ids: Schema.Types.ObjectId[];
  shared_with_user_ids: Schema.Types.ObjectId[];
  blocked_user_ids: Schema.Types.ObjectId[];

  emergency: IEmergency;
  settings: ISettings;
  comparePassword(password: string): Promise<boolean>;
}

interface ICircleMember {
  user_id: Schema.Types.ObjectId;
  role: string;
}

interface ICircle {
  _id: string;
  name: string;
  created_by: string;
  members: ICircleMember[];
  created_at: Date;
}

interface IFriend {
  _id: string;
  requester: Schema.Types.ObjectId | IUser;
  recipient: Schema.Types.ObjectId | IUser;
  status: "pending" | "accepted";
  share_location: {
    requester_to_recipient: boolean;
    recipient_to_requester: boolean;
  };
}

export {
  IUser,
  ILocation,
  IEmergency,
  ISettings,
  ILocationVisibilitySchedule,
  ICircle,
  ICircleMember,
  IFriend,
};
