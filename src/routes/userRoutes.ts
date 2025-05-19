import express from "express";
import {
  acceptFriendRequest,
  addFriend,
  deleteFriend,
  findFriends,
  getAllFriends,
  getAllPendingRequests,
  locationSharing,
  updateCurrentLocation,
  updateFriendLocationSharing,
} from "../controllers/userController";
import protect from "../middlewares/protect";

const router = express.Router();

router.patch("/users/:id/location-sharing", locationSharing);
router.patch("/users/:id/current-location", updateCurrentLocation);

router.get("/users/search", protect, findFriends);
router.post("/users/add-friend", addFriend);
router.get("/users/friends", getAllFriends);
router.get("/users/pending-requests", protect, getAllPendingRequests);
router
  .route("/users/friend-requests/:id")
  .patch(protect, acceptFriendRequest)
  .delete(protect, deleteFriend);
router.get("/users/friends", protect, findFriends);
router.patch(
  "/users/friends/:id/location-sharing-status",
  protect,
  updateFriendLocationSharing
);

export default router;
