import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

export const makeMessage = async (req, res) => {
	try {
		const { chat_id } = req.body;
		const newMessage = new Message(req.body);
		const savedMessage = await newMessage.save();

		const chat = await Chat.findById(chat_id);
		chat.latestMessage = savedMessage._id;
		await chat.save();

		res.status(200).json(savedMessage);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const getMessage = async (req, res) => {
	try {
		const message_id = req.params.message_id;
		const lastMessage = await Message.findById(message_id);
		res.status(200).json(lastMessage);
	} catch (err) {
		res.status(404).json({ message: err.message });
	}
};

export const getMessages = async (req, res) => {
	try {
		const messages = await Message.find({
			chat_id: req.params.chat_id,
		});
		res.status(200).json(messages);
	} catch (err) {
		res.status(404).json({ message: err.message });
	}
};
