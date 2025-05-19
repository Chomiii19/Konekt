import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import appRoutes from "./routes/appRoutes";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/globalErrorHandler";
import io from "./server";

const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/", (req, res, next) => {
  req.io = io;
  next();
});
app.use("/api/v1", authRoutes);
app.use("/api/v1/app", appRoutes);
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
