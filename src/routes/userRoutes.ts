import express from "express";
import {
  locationSharing,
  updateCurrentLocation,
} from "../controllers/userController";

const router = express.Router();

router.patch("/:id/location-sharing", locationSharing);
router.patch("/:id/current-location", updateCurrentLocation);

export default router;
