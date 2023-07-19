import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
	{
		chat_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Chat",
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		content: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;
