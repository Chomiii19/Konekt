import express from "express";
import {
  login,
  signup,
  emailVerification,
} from "../controllers/authController";
import protect from "../middlewares/protect";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/verify-email", protect, emailVerification);

export default router;
