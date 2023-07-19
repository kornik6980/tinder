import express from "express";
import { makeChat, getUserChats } from "../controllers/chats.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/:user_id", verifyToken, getUserChats);
router.post("/", verifyToken, makeChat);

export default router;
