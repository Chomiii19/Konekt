import { Socket } from "socket.io";
import { IUser } from "../models/userInterfaces";

declare module "socket.io" {
  interface Socket {
    user?: IUser;
  }
}
