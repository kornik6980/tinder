import { useState } from "react";
import Nav from "scenes/components/Navbar";
import Auth from "scenes/components/Auth";

const HomePage = () => {
	const [type, setType] = useState("register");
	const [showModal, setShowModal] = useState(false);

	const handleClick = () => {
		setType("register");
		setShowModal(true);
	};

	return (
		<div className="overlay">
			<Nav setShowModal={setShowModal} setType={setType} />
			<div className="home">
				<h1 className="primary-title">
					Swipe Right<span>®</span>
				</h1>
				<button className="primary-button" onClick={handleClick}>
					Create account
				</button>

				{showModal && (
					<Auth setShowModal={setShowModal} type={type} setType={setType} />
				)}
			</div>
		</div>
	);
};

export default HomePage;
