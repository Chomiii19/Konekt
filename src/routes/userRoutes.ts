import express from "express";
import { locationSharing } from "../controllers/userController";

const router = express.Router();

router.patch("/:id/location-sharing", locationSharing);

export default router;
