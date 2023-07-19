import express from "express";
import {
	getMessage,
	getMessages,
	makeMessage,
} from "../controllers/messages.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", makeMessage);
router.get("/message/:message_id", verifyToken, getMessage);
router.get("/:chat_id", verifyToken, getMessages);

export default router;
