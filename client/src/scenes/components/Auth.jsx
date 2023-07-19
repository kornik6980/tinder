import { useNavigate } from "react-router-dom";
import Form from "./loginForm";
import fire from "images/color-fire-tinder.png";

const AuthModal = ({ setShowModal, type, setType }) => {
	const navigate = useNavigate();
	const isLogin = type === "login";

	const handleClick = () => {
		setShowModal(false);
	};

	const handleSwap = () => {
		setType(type === "login" ? "register" : "login");
	};

	const handleContinue = () => {
		navigate("/register");
	};

	return (
		<div className="modal-container">
			<div className="modal-content">
				<button onClick={handleClick} className="cross-button">
					&#10005;
				</button>
				<img className="fire" src={fire} alt="fire" />
				<h2>{type === "register" ? "Create account" : "Get started"}</h2>
				{!isLogin ? (
					<>
						<p className="terms">
							By clicking Continue, you agree to our terms. Learn how we process
							your data in our Privacy Policy and Cookie Policy.
						</p>
						<p className="question">Do you want to create new account?</p>
						<button className="continue-button" onClick={handleContinue}>
							Continue
						</button>
					</>
				) : (
					<>
						<Form />
					</>
				)}
				<p className="text-button" onClick={handleSwap}>
					{isLogin
						? "Don't have an account? Sign Up here."
						: "Already have an account? Login here."}
				</p>
			</div>
		</div>
	);
};

export default AuthModal;
