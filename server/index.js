import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import swipesRoutes from "./routes/swipes.js";
import chatsRoutes from "./routes/chats.js";
import messagesRoutes from "./routes/messages.js";
import { register } from "./controllers/auth.js";
import { updateUserProfile } from "./controllers/users.js";
import { Server } from "socket.io";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/assets");
	},
	filename: function (req, file, cb) {
		const UUID = uuid();
		const fileExtension = file.originalname.split(".").pop();
		const fileName = `${UUID}.${fileExtension}`;
		cb(null, fileName);
	},
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post(
	"/users/update/profile/:user_id",
	upload.array("pictures", 9),
	updateUserProfile
);
app.post("/auth/register", upload.array("pictures", 9), register);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/swipes", swipesRoutes);
app.use("/chats", chatsRoutes);
app.use("/messages", messagesRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
	.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
	})
	.catch((error) => console.log(`${error} did not connect`));

const io = new Server(8900, {
	cors: {
		origin: "http://localhost:3000",
	},
});

let users = [];

const addUser = (userId, socketId) => {
	!users.some((user) => user.userId === userId) &&
		users.push({ userId, socketId });
};

const removeUser = (socketId) => {
	users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
	return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
	console.log(`a user connected ${socket.id}`);
	socket.on("addUser", (userId) => {
		addUser(userId, socket.id);
	});

	socket.on("sendMessage", ({ senderId, receiverId, content }) => {
		const user = getUser(receiverId);
		io.to(user.socketId).emit("getMessage", {
			senderId,
			content,
		});
	});

	socket.on("disconnect", () => {
		console.log("a user disconnected!");
		removeUser(socket.id);
	});
});
