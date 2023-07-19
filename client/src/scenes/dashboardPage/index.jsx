import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setMatches } from "state";
import Matches from "scenes/components/Matches";
import Chat from "scenes/components/Chat";
import ChatModal from "scenes/components/ChatModal";
import UserImage from "scenes/components/UserImage";
import SwipeCard from "scenes/components/SwipeCard";
import Card from "scenes/components/Card";

const DashboardPage = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [swipes, setSwipes] = useState([]);
	const [profiles, setProfiles] = useState([]);
	const [chats, setChats] = useState([]);
	const [contentType, setContentType] = useState("matches");
	const [currentChat, setCurrentChat] = useState(null);
	const [isDragged, setIsDragged] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [currentProfileIndex, setCurrentProfileIndex] = useState(
		profiles.length - 1
	);
	const { _id, first_name, show_me, gender, profile_pictures_path } =
		useSelector((state) => state.user);
	const token = useSelector((state) => state.token);
	const matches = useSelector((state) => state.matches);

	const likes = swipes.filter((swipe) => swipe.swipe_direction === "right");

	const swipeCardRefs = useRef([]);

	const getSwipes = async () => {
		const response = await fetch(`http://localhost:3001/swipes/${_id}`, {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await response.json();
		setSwipes(data);
	};

	const addSwipe = async (swiped_user_id, dir) => {
		const response = await fetch(`http://localhost:3001/swipes`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_id: _id,
				swiped_user_id: swiped_user_id,
				swipe_direction: dir,
			}),
		});
		const data = await response.json();
		if (data === { message: "matching swipe found, match created" })
			getMatches();
	};

	const getMatches = async () => {
		const response = await fetch(`http://localhost:3001/users/matches/${_id}`, {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await response.json();
		dispatch(setMatches({ matches: data }));
	};

	const getProfiles = async () => {
		const params = new URLSearchParams();
		if (_id) params.append("id", _id);
		if (gender) params.append("gender", gender);
		if (show_me.desired_gender)
			params.append("desiredGender", show_me.desired_gender);
		if (show_me.age_range.min && show_me.age_range.max) {
			params.append("min", show_me.age_range.min);
			params.append("max", show_me.age_range.max);
		}
		const queryString = params.toString();

		const response = await fetch(
			`http://localhost:3001/users/profiles?${queryString}`,
			{
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		const data = await response.json();
		setProfiles(data);
	};

	const getChats = async () => {
		const response = await fetch(`http://localhost:3001/chats/${_id}`, {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await response.json();
		setChats(data);
	};

	const navigateProfile = () => {
		navigate("/profile");
	};
	const swapToMatches = () => {
		setContentType("matches");
	};
	const swapToMessages = () => {
		setContentType("messages");
	};

	useEffect(() => {
		getSwipes();
		getMatches();
		getProfiles();
		getChats();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		setCurrentProfileIndex(profiles.length - 1);
	}, [profiles]);

	const onSwipe = async (dir, swiped_user_id) => {
		setProfiles((prevProfiles) => {
			const updatedProfiles = [...prevProfiles];
			updatedProfiles.pop();
			return updatedProfiles;
		});
		setCurrentProfileIndex((prevIndex) => prevIndex - 1);
		setIsAnimating(false);
		addSwipe(swiped_user_id, dir);
	};

	const swipe = async (dir) => {
		if (isAnimating) return;
		if (currentProfileIndex >= 0) {
			swipeCardRefs.current[currentProfileIndex]?.swipe(dir);
			setIsAnimating(true);
		}
	};

	const handleCloseChat = () => {
		setCurrentChat(null);
	};

	return (
		<div style={{ display: "flex", height: "100%" }}>
			<div
				className={`dashboard-navbar ${isDragged ? "disabled" : ""}`}
				style={{ flexBasis: "20%", minWidth: "375px" }}>
				<div>
					<div className="navigation-container">
						<div
							className={`navigation ${isDragged ? "disabled" : ""}`}
							onClick={navigateProfile}>
							<UserImage image={profile_pictures_path[0]} />
							<p>{first_name}</p>
						</div>
					</div>
					<div className="type-display">
						<button
							onClick={swapToMatches}
							className={`matches-button ${
								contentType === "matches" ? "visible" : ""
							}`}>
							Matches
						</button>
						<button
							onClick={swapToMessages}
							className={`messages-button ${
								contentType === "messages" ? "visible" : ""
							}`}>
							Messages
						</button>
					</div>
				</div>
				<div style={{ overflow: "scroll", height: "100%" }}>
					{contentType === "matches" ? (
						<Matches
							likes={likes}
							matches={matches}
							setCurrentChat={setCurrentChat}
							id={_id}
						/>
					) : (
						<div style={{ height: "100%", overflow: "scroll" }}>
							{chats.length > 0 ? (
								chats.map((chat, _index) => (
									<div key={_index} onClick={() => setCurrentChat(chat)}>
										<Chat chat={chat} id={_id} currentChat={currentChat} />
									</div>
								))
							) : (
								<div
									style={{
										padding: "10px",
										height: "50vh",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}>
									No messages yet
								</div>
							)}
						</div>
					)}
				</div>
			</div>
			<div className="swipe-container">
				{profiles && profiles.length > 0 ? (
					profiles.map((profile, _index) => (
						<SwipeCard
							key={_index}
							ref={(ref) => (swipeCardRefs.current[_index] = ref)}
							className="swipe-card"
							onSwipe={(dir) => onSwipe(dir, profile._id)}
							onDrag={(drag) => setIsDragged(drag)}>
							<Card profile={profile} isDragged={isDragged} />
						</SwipeCard>
					))
				) : (
					<div>
						<p>Nothing to show :(</p>
					</div>
				)}
				{profiles && profiles.length > 0 && (
					<>
						<div className="loading-spinner"></div>
						<div className="swipe-buttons">
							<button onClick={() => swipe("left")} className="red">
								&#10013;
							</button>
							<button onClick={() => swipe("right")} className="green">
								&#10084;
							</button>
						</div>
					</>
				)}
				{currentChat && (
					<ChatModal
						currentChat={currentChat}
						setCurrentChat={setCurrentChat}
						id={_id}
						onClose={handleCloseChat}
						setMatches={setMatches}
					/>
				)}
			</div>
		</div>
	);
};

export default DashboardPage;
