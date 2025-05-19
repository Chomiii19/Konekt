import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";

dotenv.config();
const PORT = process.env.PORT;
const DB = `${process.env.DB_URI}`.replace(
  "<db_password>",
  process.env.DB_PASSWORD as string
);

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log("DB connection failed!", err));

app.listen(PORT, () => console.log(`App running on port ${PORT}...`));
