import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "images/tinder_logo_white.png";

const Nav = ({ setShowModal, setType }) => {
	const navigate = useNavigate();
	const isAuth = Boolean(useSelector((state) => state.token));

	const handleClick = () => {
		if (isAuth) {
			navigate("/dashboard");
		}
		setType("login");
		setShowModal(true);
	};

	return (
		<nav>
			<div className="logo-container">
				<img className="logo" src={logo} alt="logo" />
			</div>
			<button className="nav-button" onClick={handleClick}>
				Log in
			</button>
		</nav>
	);
};
export default Nav;
