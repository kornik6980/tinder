import React, { useState, useCallback } from "react";
import { Formik, Field } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import Dropzone from "react-dropzone";
import Cropper from "react-easy-crop";
import DatePicker from "react-datepicker";
import "./datepicker.css";
import { getCroppedImg } from "./canvasUtils";
import Modal from "scenes/components/Modal";
import enGB from "date-fns/locale/en-GB";

const registerSchema = yup.object().shape({
	first_name: yup.string().required("required"),
	email: yup.string().email("invalid email").required("required"),
	password: yup.string().required("required"),
	gender: yup.string().oneOf(["male", "female"]).required("required"),
	desiredGender: yup
		.string()
		.oneOf(["male", "female", "both"])
		.required("required"),
	date_of_birth: yup.date().required("required"),
	bio: yup.string().required("required"),
});

const initialValues = {
	first_name: "",
	email: "",
	password: "",
	gender: "",
	desiredGender: "",
	date_of_birth: "",
	bio: "",
};

const Form = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [imageSrc, setImageSrc] = useState(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	const [savedImage, setSavedImage] = useState([]);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const register = async (values, onSubmitProps) => {
		if (savedImage.length === 0) {
			return;
		}
		const formData = new FormData();
		for (let key in values) {
			formData.append(key, values[key]);
		}
		for (let i in savedImage) {
			formData.append("pictures", savedImage[i]);
		}

		const savedUserResponse = await fetch(
			"http://localhost:3001/auth/register",
			{
				method: "POST",
				body: formData,
			}
		);
		const savedUser = await savedUserResponse.json();
		onSubmitProps.resetForm();

		if (savedUser) {
			const loggedInResponse = await fetch("http://localhost:3001/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});
			const loggedIn = await loggedInResponse.json();

			if (loggedIn) {
				dispatch(
					setLogin({
						user: loggedIn.user,
						token: loggedIn.token,
					})
				);
				navigate("/dashboard");
			}
		}
	};

	const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		setCroppedAreaPixels(croppedAreaPixels);
	}, []);

	const saveCroppedImage = useCallback(async () => {
		try {
			const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
			/* console.log("donee", { croppedImage }); */
			setSavedImage([...savedImage, croppedImage]);
			setIsOpen(false);
		} catch (err) {
			console.error(err);
		}
	}, [imageSrc, croppedAreaPixels, savedImage]);

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
		const updatedSavedImages = savedImage.filter((_, i) => i !== index);
		setSavedImage(updatedSavedImages);
	};

	const getMinDate = () => {
		const today = new Date();
		const minDate = new Date();
		minDate.setFullYear(minDate.getFullYear() - 99);
		return minDate > today ? today : minDate;
	};

	const getMaxDate = () => {
		const maxDate = new Date();
		maxDate.setFullYear(maxDate.getFullYear() - 18);
		return maxDate;
	};

	return (
		<Formik
			onSubmit={register}
			initialValues={initialValues}
			validationSchema={registerSchema}>
			{({ values, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
				<form onSubmit={handleSubmit}>
					<div className="register-column-container">
						<div className="register-column">
							<div className="row">
								<label htmlFor="first_name">First Name</label>
								<Field
									className="text-input-field"
									value={values.first_name}
									type="text"
									id="first_name"
									name="first_name"
									onBlur={handleBlur}
									onChange={handleChange}
									autoComplete="off"
								/>
							</div>

							<div className="row">
								<label htmlFor="email">Email</label>
								<Field
									className="text-input-field"
									value={values.email}
									type="text"
									id="email"
									name="email"
									onBlur={handleBlur}
									onChange={handleChange}
								/>
							</div>

							<div className="row">
								<label htmlFor="password">Password</label>
								<Field
									className="text-input-field"
									value={values.password}
									type="password"
									id="password"
									name="password"
									onBlur={handleBlur}
									onChange={handleChange}
								/>
							</div>

							<div className="row">
								<label htmlFor="date_of_birth">Birthday</label>
								<DatePicker
									className="text-input-field"
									id="date_of_birth"
									name="date_of_birth"
									dateFormat="dd.MM.yyyy"
									selected={values.date_of_birth}
									onChange={(date) => setFieldValue("date_of_birth", date)}
									onBlur={handleBlur}
									minDate={getMinDate()}
									maxDate={getMaxDate()}
									showYearDropdown
									dropdownMode="select"
									locale={enGB}
									autoComplete="off"
									placeholderText="dd.mm.yyyy"
								/>
							</div>

							<div className="row">
								<label htmlFor="gender">Gender</label>
								<div style={{ display: "flex", gap: "0.5rem" }}>
									<label className="radio-label">
										<Field
											onBlur={handleBlur}
											type="radio"
											name="gender"
											value="male"
											onChange={() => setFieldValue("gender", "male")}
										/>
										<span>Man</span>
									</label>
									<label className="radio-label">
										<Field
											onBlur={handleBlur}
											type="radio"
											name="gender"
											value="female"
											onChange={() => setFieldValue("gender", "female")}
										/>
										<span>Woman</span>
									</label>
								</div>
							</div>

							<div className="row">
								<label htmlFor="show_me">Show Me</label>
								<div style={{ display: "flex", gap: "0.5rem" }}>
									<label className="radio-label">
										<Field
											onBlur={handleBlur}
											type="radio"
											name="desiredGender"
											value="male"
											onChange={() => setFieldValue("desiredGender", "male")}
										/>
										<span>Man</span>
									</label>
									<label className="radio-label">
										<Field
											onBlur={handleBlur}
											type="radio"
											name="desiredGender"
											value="female"
											onChange={() => setFieldValue("desiredGender", "female")}
										/>
										<span>Woman</span>
									</label>
									<label className="radio-label">
										<Field
											onBlur={handleBlur}
											type="radio"
											name="desiredGender"
											value="both"
											onChange={() => setFieldValue("desiredGender", "both")}
										/>
										<span>Both</span>
									</label>
								</div>
							</div>

							<div className="row">
								<label htmlFor="bio">Bio</label>
								<Field
									className="text-input-field bio"
									value={values.bio}
									onBlur={handleBlur}
									onChange={handleChange}
									as="textarea"
									id="bio"
									name="bio"
									maxLength="200"
								/>
							</div>
						</div>

						<div style={{ flexBasis: "50%" }}>
							<div className="row">
								<label htmlFor="pictures">Add pictures</label>
								<div className="pictures-container">
									{savedImage.map((value, index) => (
										<div className="picture-card" key={index}>
											<img
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
									{savedImage.length < 9 && (
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
									{savedImage.length < 9 &&
										Array(8 - savedImage.length)
											.fill("elo")
											.map((_, index) => (
												<div key={index} className="picture-card"></div>
											))}
								</div>
							</div>
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
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							marginTop: "30px",
						}}>
						<button className="register-button" type="submit">
							Continue
						</button>
					</div>
				</form>
			)}
		</Formik>
	);
};

export default Form;
