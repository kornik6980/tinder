import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Message from "./Message";
import { io } from "socket.io-client";

const ChatModal = ({
	currentChat,
	setCurrentChat,
	id,
	onClose,
	setMatches,
}) => {
	const token = useSelector((state) => state.token);
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [arrivalMessage, setArrivalMessage] = useState(null);
	const [user, setUser] = useState(null);
	const [images, setImages] = useState([]);
	const [currentSlide, setCurrentSlide] = useState(0);
	const user_id = currentChat.members.find((m) => m !== id);
	const socket = useRef();

	const calculateAge = (date_of_birth) => {
		const now = new Date();
		const birthDate = new Date(date_of_birth);
		const diff = now - birthDate.getTime();
		const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
		return age;
	};

	const getMessages = async () => {
		if (!currentChat._id) {
			setMessages([]);
			return;
		}
		const response = await fetch(
			`http://localhost:3001/messages/${currentChat?._id}`,
			{
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		const data = await response.json();
		setMessages(data);
	};

	const getUser = async () => {
		const response = await fetch(`http://localhost:3001/users/${user_id}`, {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await response.json();
		setUser(data);
	};

	const fetchImages = async () => {
		if (user) {
			const imagePromises = user.profile_pictures_path.map(async (picture) => {
				const response = await fetch(`http://localhost:3001/assets/${picture}`);
				const blob = await response.blob();
				return URL.createObjectURL(blob);
			});

			const resolvedImages = await Promise.all(imagePromises);
			setImages(resolvedImages);
		}
	};

	useEffect(() => {
		getMessages();
		getUser();
		setCurrentSlide(0);
	}, [currentChat]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		fetchImages();
	}, [user]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		socket.current = io("ws://localhost:8900");
		socket.current.emit("addUser", id);
		socket.current.on("getMessage", (data) => {
			setArrivalMessage({
				sender: data.senderId,
				content: data.content,
				createdAt: Date.now(),
			});
		});
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		arrivalMessage &&
			currentChat.members.includes(arrivalMessage.sender) &&
			setMessages((prev) => [...prev, arrivalMessage]);
	}, [arrivalMessage, currentChat]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (messages.length === 0) {
			const newChat = {
				sender_id: id,
				receiver_id: user_id,
				content: newMessage,
			};
			const chatResponse = await fetch(`http://localhost:3001/chats`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(newChat),
			});
			const chatData = await chatResponse.json();
			const matchesResponse = await fetch(
				`http://localhost:3001/users/${id}/${user_id}`,
				{
					method: "PATCH",
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			const matchesData = await matchesResponse.json();
			setMatches(matchesData);
			setCurrentChat(chatData.chat);
			setMessages([...messages, chatData.message]);

			socket.current.emit("sendMessage", {
				senderId: id,
				receiverId: user_id,
				content: newMessage,
			});
		} else {
			const message = {
				sender: id,
				content: newMessage,
				chat_id: currentChat._id,
			};
			const messageResponse = await fetch(`http://localhost:3001/messages`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(message),
			});
			const messageData = await messageResponse.json();
			setMessages([...messages, messageData]);
			socket.current.emit("sendMessage", {
				senderId: id,
				receiverId: user_id,
				content: newMessage,
			});
		}
		setNewMessage("");
	};

	const goToSlide = (slideIndex) => {
		setCurrentSlide(slideIndex);
	};

	const goToPreviousSlide = () => {
		setCurrentSlide((prevSlide) =>
			prevSlide === 0 ? prevSlide : prevSlide - 1
		);
	};

	const goToNextSlide = () => {
		setCurrentSlide((prevSlide) =>
			prevSlide === images.length - 1 ? prevSlide : prevSlide + 1
		);
	};

	const handleClick = (event) => {
		const { clientX, target } = event;
		const { width, x } = target.getBoundingClientRect();
		const clickPosition = clientX - x;

		if (clickPosition <= width / 2) {
			goToPreviousSlide();
		} else {
			goToNextSlide();
		}
	};

	return (
		<div className="chat-modal">
			<div className="chat-box">
				<div className="chat-box-top">
					<button onClick={onClose} className="cross-button">
						&#10005;
					</button>
					{messages.length > 0 &&
						messages.map((message, _index) => (
							<div key={_index}>
								<Message
									message={message}
									own={message.sender === id}
									user={user}
								/>
							</div>
						))}
				</div>
				<div className="chat-box-bottom">
					<input
						type="text"
						className="chat-input"
						placeholder="Write something..."
						onChange={(e) => setNewMessage(e.target.value)}
						value={newMessage}
					/>
					<button
						disabled={newMessage === ""}
						className="chat-submit"
						onClick={handleSubmit}>
						send
					</button>
				</div>
			</div>
			<div className="profile-box">
				<div style={{ position: "relative" }}>
					<div className="carousel-dots">
						{images.map((_, index) => (
							<span
								key={index}
								className={`carousel-dot ${
									index === currentSlide ? "active" : ""
								}`}
								onClick={() => goToSlide(index)}
								style={{ width: `${95 / images.length}%` }}>
								{""}
							</span>
						))}
					</div>
					<img
						width="100%"
						src={images[currentSlide]}
						alt=""
						onMouseUp={handleClick}
						draggable="false"
					/>
				</div>
				<div
					style={{
						height: "10vh",
					}}>
					<div style={{ width: "95%", margin: "10px" }}>
						<p>
							<span style={{ fontWeight: "bolder", fontSize: "32px" }}>
								{user?.first_name}
							</span>
							{"  "}
							<span style={{ fontWeight: "bolder", fontSize: "28px" }}>
								{calculateAge(user?.date_of_birth)}
							</span>
						</p>
					</div>
					<div
						style={{
							width: "100%",
							height: "1px",
							background: "#424242",
						}}></div>
					<div
						style={{
							width: "95%",
							margin: "10px",
							display: "inline-block",
						}}>
						<h2>About me:</h2>
						<p>{user?.bio}</p>
					</div>
					<div
						style={{
							width: "100%",
							height: "1px",
							background: "#424242",
						}}></div>
					<div
						style={{
							width: "95%",
							margin: "10px",
							display: "inline-block",
						}}>
						<h2>My gender:</h2>
						<p>
							<span
								style={{
									textTransform: "capitalize",
								}}>
								{user?.gender}
							</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatModal;
