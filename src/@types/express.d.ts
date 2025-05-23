import { IUser } from "./userInterfaces";
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      io?: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    }
  }
}
