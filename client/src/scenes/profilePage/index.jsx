import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLogout, setUser } from "state";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "scenes/RegisterPage/canvasUtils";
import Slider from "@mui/material/Slider";
import Carousel from "scenes/components/Carousel";
import Modal from "scenes/components/Modal";
import logo from "images/color-fire-tinder.png";

const ProfilePage = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [images, setImages] = useState([]);
	const [imagesURLs, setImagesURLs] = useState([]);
	const [mode, setMode] = useState("profile");
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const [showGenderSelect, setShowGenderSelect] = useState(false);
	const {
		_id,
		first_name,
		gender,
		date_of_birth,
		bio,
		profile_pictures_path,
		show_me,
	} = useSelector((state) => state.user);
	const token = useSelector((state) => state.token);
	const [ageRange, setAgeRange] = useState([
		show_me.age_range.min,
		show_me.age_range.max,
	]);
	const [desiredGender, setDesiredGender] = useState(show_me.desired_gender);
	const [newBio, setNewBio] = useState(bio);

	const [isOpen, setIsOpen] = useState(false);
	const [imageSrc, setImageSrc] = useState(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

	const thumbStyles = {
		height: 28,
		width: 28,
		backgroundColor: "#FFFFFF",
		border: "3px solid #FF4B61",
		borderRadius: "50%",
		boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.3)",
		zIndex: 1,
	};

	const sliderStyles = {
		color: "#FF4B61",
		height: 8,
		padding: "15px 0",
	};

	const sliderTrackStyles = {
		backgroundColor: "#FF4B61",
	};

	const sliderRailStyles = {
		backgroundColor: "rgba(0, 0, 0, 0.1)",
	};

	const fetchImages = async () => {
		const imagePromises = profile_pictures_path.map(async (picture) => {
			const response = await fetch(`http://localhost:3001/assets/${picture}`);
			const blob = await response.blob();
			return blob;
		});
		const resolvedImages = await Promise.all(imagePromises);
		const resolvedImagesUrls = await Promise.all(
			resolvedImages.map((value) => URL.createObjectURL(value))
		);
		setImages(resolvedImages);
		setImagesURLs(resolvedImagesUrls);
	};

	const updatePreferences = async () => {
		const response = await fetch(
			`http://localhost:3001/users/update/preferences/${_id}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					min: ageRange[0],
					max: ageRange[1],
					desiredGender: desiredGender,
				}),
			}
		);
		const data = await response.json();
		dispatch(setUser({ user: data }));
	};

	const updateProfile = async () => {
		if (images.length === 0) return;
		const formData = new FormData();
		formData.append("bio", newBio);
		for (let i in images) {
			formData.append("pictures", images[i]);
		}
		const response = await fetch(
			`http://localhost:3001/users/update/profile/${_id}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			}
		);
		const data = await response.json();
		dispatch(setUser({ user: data }));
		fetchImages();
	};

	const calculateAge = (date_of_birth) => {
		const now = new Date();
		const birthDate = new Date(date_of_birth);
		const diff = now - birthDate.getTime();
		const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
		return age;
	};

	const deleteUser = async () => {
		const response = await fetch(`http://localhost:3001/users/${_id}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = await response.json();
		if (data) {
			console.log(data);
		}
		navigate("/");
		dispatch(setLogout());
	};

	const age = calculateAge(date_of_birth);

	useEffect(() => {
		fetchImages();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const navigateDashboard = () => {
		updatePreferences();
		navigate("/dashboard");
	};

	const logout = () => {
		dispatch(setLogout());
		navigate("/");
	};

	const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	const saveCroppedImage = useCallback(async () => {
		try {
			const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
			/* console.log("donee", { croppedImage }); */
			setImages([...images, croppedImage]);
			setIsOpen(false);
		} catch (err) {
			console.error(err);
		}
	}, [imageSrc, croppedAreaPixels, images]);

	function readFile(file) {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.addEventListener("load", () => resolve(reader.result), false);
			reader.readAsDataURL(file);
		});
	}

	const onDrop = useCallback(async (acceptedFiles) => {
		if (acceptedFiles.length > 0) {
			const file = acceptedFiles[0];
			const imageDataUrl = await readFile(file);
			setImageSrc(imageDataUrl);
			setIsOpen(true);
		}
	}, []);

	const handleCloseModal = () => {
		setIsOpen(false);
		setImageSrc(null);
	};

	const handleCloseImg = (index) => {
		const updatedImages = images.filter((_, i) => i !== index);
		setImages(updatedImages);
	};

	const handleBioChange = (event) => {
		setNewBio(event.target.value);
	};

	return (
		<div style={{ display: "flex", height: "100%" }}>
			<div
				className="dashboard-navbar"
				style={{ flexBasis: "20%", minWidth: "375px", background: "#222" }}>
				<div>
					<div className="navigation-container">
						<div className="navigation2" onClick={navigateDashboard}>
							<img style={{ width: "15px" }} src={logo} alt="" />
						</div>
					</div>
					{showGenderSelect ? (
						<>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									padding: "25px 0",
									gap: "25px",
								}}>
								<div>
									<div
										onClick={() => setDesiredGender("male")}
										style={{
											background: "#111",
											padding: "10px 15px",
											borderTop: "1px solid #424242",
											borderBottom: "1px solid #424242",
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											cursor: "pointer",
										}}>
										<p>Man</p>
										{desiredGender === "male" && (
											<p style={{ color: "#fe3c72" }}>&#x2713;</p>
										)}
									</div>
									<div
										onClick={() => setDesiredGender("female")}
										style={{
											background: "#111",
											padding: "10px 15px",
											borderBottom: "1px solid #424242",
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											cursor: "pointer",
										}}>
										<p>Woman</p>
										{desiredGender === "female" && (
											<p style={{ color: "#fe3c72" }}>&#x2713;</p>
										)}
									</div>
									<div
										onClick={() => setDesiredGender("both")}
										style={{
											background: "#111",
											padding: "10px 15px",
											borderBottom: "1px solid #424242",
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											cursor: "pointer",
										}}>
										<p>Both</p>
										{desiredGender === "both" && (
											<p style={{ color: "#fe3c72" }}>&#x2713;</p>
										)}
									</div>
								</div>
								<div
									onClick={() => setShowGenderSelect(false)}
									style={{
										background: "#111",
										padding: "10px 15px",
										borderTop: "1px solid #424242",
										borderBottom: "1px solid #424242",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										cursor: "pointer",
									}}>
									OK
								</div>
							</div>
						</>
					) : (
						<>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "25px",
								}}>
								<div>
									<p
										style={{
											padding: "25px 15px 5px 15px",
											fontSize: "18px",
											fontWeight: "700",
											color: "#a4a4a4",
										}}>
										Account settings
									</p>
									<div
										style={{
											background: "#111",
											padding: "10px 15px",
											borderTop: "1px solid #424242",
											borderBottom: "1px solid #424242",
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}>
										<p>Looking for</p>
										<p
											className="desired-gender"
											onClick={() => setShowGenderSelect(true)}>
											{desiredGender} <span>&#8250;</span>
										</p>
									</div>
									<div
										style={{
											background: "#111",
											padding: "10px 15px",
											borderBottom: "1px solid #424242",
										}}>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
											}}>
											<p>Preferred age</p>
											<p style={{ color: "#a4a4a4" }}>
												{ageRange[0]} - {ageRange[1]}
											</p>
										</div>

										<div>
											<style>
												{`
												.MuiSlider-thumb:hover,
												.MuiSlider-thumb.Mui-focusVisible,
												.MuiSlider-thumb.Mui-active {
													box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
												}
											`}
											</style>
											<Slider
												value={ageRange}
												min={18}
												max={99}
												onChange={(e, value) => setAgeRange(value)}
												style={sliderStyles}
												ThumbComponent={(props) => (
													<span {...props} style={thumbStyles} />
												)}
												trackStyle={sliderTrackStyles}
												railStyle={sliderRailStyles}
											/>
										</div>
									</div>
								</div>
								<div>
									<div className="profile-button-settings" onClick={logout}>
										<p>Logout</p>
									</div>
								</div>
								<div
									style={{
										height: "80px",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
										}}>
										<img src={logo} alt="" style={{ width: "20px" }} />
										<p style={{ margin: "10px" }}>Version 1.0</p>
									</div>
								</div>
								<div>
									<div
										className="profile-button-settings"
										onClick={() => setDeleteConfirm(true)}>
										<p>Delete account</p>
									</div>
									{deleteConfirm && (
										<>
											<div
												style={{
													background: "#111",
													padding: "10px 15px",
													borderBottom: "1px solid #424242",
												}}>
												<p
													style={{
														margin: "0",
														fontSize: "12px",
														color: "#a4a4a4",
														textAlign: "center",
													}}>
													Please take note that action is permanent and cannot
													be reversed. Are you sure that you want to continue?
												</p>
											</div>
											<div
												style={{
													background: "#111",
													padding: "10px 15px",
													borderBottom: "1px solid #424242",
												}}>
												<div
													style={{
														display: "flex",
														justifyContent: "space-around",
													}}>
													<div
														className="confirm-button"
														onClick={() => deleteUser()}>
														Confirm
													</div>
													<div
														style={{ cursor: "pointer" }}
														onClick={() => setDeleteConfirm(false)}>
														Cancel
													</div>
												</div>
											</div>
										</>
									)}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
			<div className="profile-container">
				<div className="profile-card">
					{mode === "profile" ? (
						<>
							<Carousel images={imagesURLs} isProfile={true} />
							<div style={{ width: "95%", margin: "10px" }}>
								<p>
									<span style={{ fontWeight: "bolder", fontSize: "32px" }}>
										{first_name}
									</span>
									{"  "}
									<span style={{ fontWeight: "bolder", fontSize: "28px" }}>
										{age}
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
								<p>{bio}</p>
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
										{gender}
									</span>
								</p>
							</div>
							<div style={{ height: "5vh" }}></div>
						</>
					) : (
						<>
							<div>
								<h2 style={{ margin: "10px" }}>My photos:</h2>
								<div className="pictures-container2">
									{images.map((value, index) => (
										<div className="picture-card" key={index}>
											<img
												draggable="false"
												style={{ height: "100%" }}
												src={URL.createObjectURL(value)}
												alt=""
											/>
											<button
												className="close-picture"
												type="button"
												onClick={() => handleCloseImg(index)}>
												&#10005;
											</button>
										</div>
									))}
									{images.length < 9 && (
										<Dropzone
											acceptedFiles=".jpg,.jpeg,.png"
											multiple={false}
											onDrop={onDrop}>
											{({ getRootProps, getInputProps }) => (
												<section>
													<div className="add-card" {...getRootProps()}>
														<input {...getInputProps()} />
														<span>+</span>
													</div>
												</section>
											)}
										</Dropzone>
									)}
									{images.length < 9 &&
										Array(8 - images.length)
											.fill("elo")
											.map((_, index) => (
												<div key={index} className="picture-card"></div>
											))}
								</div>
								<div className="new-bio-container">
									<h2>About me:</h2>
									<div className="bio-flex">
										<textarea
											className="new-bio-input"
											value={newBio}
											onChange={handleBioChange}
											maxLength="200"></textarea>
									</div>
								</div>
								<div style={{ height: "6vh" }}></div>
								<Modal
									isOpen={isOpen}
									onClose={handleCloseModal}
									zoom={zoom}
									setZoom={setZoom}
									saveCroppedImage={saveCroppedImage}>
									<Cropper
										image={imageSrc}
										crop={crop}
										zoom={zoom}
										aspect={3 / 4}
										onCropChange={setCrop}
										onZoomChange={setZoom}
										onCropComplete={onCropComplete}
									/>
								</Modal>
							</div>
						</>
					)}
				</div>
				{mode === "profile" ? (
					<button className="edit-button" onClick={() => setMode("edit")}>
						edit profile
					</button>
				) : (
					<button
						className="save-button"
						onClick={() => {
							updateProfile();
							setMode("profile");
						}}>
						save
					</button>
				)}
			</div>
		</div>
	);
};

export default ProfilePage;
