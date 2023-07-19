import { useNavigate } from "react-router-dom";
import Form from "./registerForm";
import logo from "images/tinder_logo_white.png";

const RegisterPage = () => {
	const navigate = useNavigate();
	const handleClick = () => {
		navigate("/");
	};

	return (
		<div className="register-container">
			<div className="logo-container">
				<img className="logo" src={logo} alt="logo" onClick={handleClick} />
			</div>
			<div>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<h1 style={{ fontStyle: "italic" }}>CREATE ACCOUNT</h1>
				</div>
				<Form />
			</div>
		</div>
	);
};

export default RegisterPage;
