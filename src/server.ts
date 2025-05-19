import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import app from "./app";

dotenv.config();
const server = http.createServer(app);
const PORT = process.env.PORT;
const DB = `${process.env.DB_URI}`.replace(
  "<db_password>",
  process.env.DB_PASSWORD as string
);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Client is connected to backend", socket.id);

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
