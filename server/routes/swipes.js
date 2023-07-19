import express from "express";
import { addSwipe, getSwipes } from "../controllers/swipes.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, addSwipe);
router.get("/:user_id", verifyToken, getSwipes);

export default router;
