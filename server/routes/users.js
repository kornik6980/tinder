import express from "express";
import {
	getUser,
	updateUserPreferences,
	getUserMatches,
	addRemoveUserMatch,
	getProfiles,
	deleteUser,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/profiles", verifyToken, getProfiles);
router.get("/matches/:user_id", verifyToken, getUserMatches);
router.get("/:user_id", verifyToken, getUser);
router.post("/update/preferences/:user_id", verifyToken, updateUserPreferences);
router.patch("/:user_id/:matchedUser_id", verifyToken, addRemoveUserMatch);
router.delete("/:user_id", verifyToken, deleteUser);

export default router;
