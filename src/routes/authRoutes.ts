import express from "express";
import { login, logout, signup, verify } from "../controllers/authController";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.post("/verify", verify);

export default router;
