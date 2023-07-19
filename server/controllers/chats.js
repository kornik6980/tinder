import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export const makeChat = async (req, res) => {
	try {
		const { sender_id, receiver_id, content } = req.body;
		if (!sender_id || !receiver_id) {
			return res.status(500).json({ message: "Not enough data. " });
		}
		const newChat = new Chat({
			members: [sender_id, receiver_id],
		});
		await newChat.save();

		const newMessage = new Message({
			chat_id: newChat._id,
			sender: sender_id,
			content: content,
		});

		const savedMessage = await newMessage.save();

		newChat.latestMessage = newMessage._id;
		const savedChat = await newChat.save();

		res.status(200).json({ chat: savedChat, message: savedMessage });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const getUserChats = async (req, res) => {
	try {
		const { user_id } = req.params;
		const chats = await Chat.find({
			members: { $in: user_id },
		});
		res.status(200).json(chats);
	} catch (err) {
		res.status(404).json({ message: err.message });
	}
};
