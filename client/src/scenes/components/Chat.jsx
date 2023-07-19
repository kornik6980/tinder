import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import UserImage from "./UserImage";

const Chat = ({ chat, id, currentChat }) => {
	const token = useSelector((state) => state.token);
	const [user, setUser] = useState(null);
	const [lastMessage, setLastMessage] = useState(null);
	const user_id = chat.members.find((m) => m !== id);
	const message_id = chat.latestMessage;
	const selected = currentChat?._id === chat._id;

	const getUser = async () => {
		const response = await fetch(`http://localhost:3001/users/${user_id}`, {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await response.json();
		setUser(data);
	};

	const getLastMessage = async () => {
		const response = await fetch(
			`http://localhost:3001/messages/message/${message_id}`,
			{
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		const data = await response.json();
		setLastMessage(data);
	};

	useEffect(() => {
		getLastMessage();
		getUser();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className={selected ? "chat selected" : "chat"}>
			{user && (
				<>
					<UserImage image={user.profile_pictures_path[0]} size={50} />
					<div
						style={{
							marginLeft: "20px",
							display: "flex",
							flexDirection: "column",
							width: "100%",
						}}>
						<span className="chat-name">{user.first_name}</span>
						{lastMessage && (
							<span
								style={{
									width: "278px",
									color: "#555",
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}>
								{lastMessage.sender === id && "↩ "}
								{lastMessage.content}
							</span>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default Chat;
