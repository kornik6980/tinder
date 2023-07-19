import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
	{
		members: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		latestMessage: {
			type: mongoose.Types.ObjectId,
			ref: "Message",
		},
	},

	{ timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);
export default Chat;
