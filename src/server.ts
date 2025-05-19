import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app";
import {
  getFriendsLocation,
  updateCurrentLocation,
} from "./controllers/userController";

dotenv.config();
const server = http.createServer(app);
const PORT = process.env.PORT;
const DB = `${process.env.DB_URI}`.replace(
  "<db_password>",
  process.env.DB_PASSWORD as string
);

const io = new Server(server);

// Getting authToken from client and storing it in socket.user
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  const user_id = socket.handshake.query.user_id;

  updateCurrentLocation(socket);
  getFriendsLocation(socket);

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log("DB connection failed!", err));

server.listen(PORT, () => console.log(`App running on port ${PORT}...`));

export default io;
