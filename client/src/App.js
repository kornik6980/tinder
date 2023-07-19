import { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import HomePage from "scenes/homePage";
import RegisterPage from "scenes/RegisterPage";
import ProfilePage from "scenes/profilePage";
import DashboardPage from "scenes/dashboardPage";
import SmallResolutionPage from "scenes/SmallResolutionPage";
import { CssBaseline } from "@mui/material";

function App() {
	const isAuth = Boolean(useSelector((state) => state.token));

	const [windowSize, setWindowSize] = useState([
		window.innerWidth,
		window.innerHeight,
	]);

	useEffect(() => {
		const handleWindowResize = () => {
			setWindowSize([window.innerWidth, window.innerHeight]);
		};

		window.addEventListener("resize", handleWindowResize);

		return () => {
			window.removeEventListener("resize", handleWindowResize);
		};
	}, []);

	return (
		<div className="app">
			<BrowserRouter>
				<CssBaseline />
				{windowSize[0] < 1000 || windowSize[1] < 750 ? (
					<Routes>
						<Route path="*" element={<SmallResolutionPage />} />
					</Routes>
				) : (
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route
							path="/register"
							element={
								!isAuth ? <RegisterPage /> : <Navigate to="/dashboard" />
							}
						/>
						<Route
							path="/dashboard"
							element={isAuth ? <DashboardPage /> : <Navigate to="/" />}
						/>
						<Route
							path="/profile"
							element={isAuth ? <ProfilePage /> : <Navigate to="/" />}
						/>
					</Routes>
				)}
			</BrowserRouter>
		</div>
	);
}

export default App;
