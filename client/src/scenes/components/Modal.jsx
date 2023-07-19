import React from "react";
import Slider from "@mui/material/Slider";

const Modal = ({
	isOpen,
	onClose,
	children,
	zoom,
	setZoom,
	saveCroppedImage,
}) => {
	if (!isOpen) return null;

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

	return (
		<div className="crop-modal-container">
			<div className="crop-modal-content">
				<button onClick={onClose} className="cross-button">
					&#10005;
				</button>
				{children}
			</div>
			<div className="slider-container">
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
					value={zoom}
					min={1}
					max={3}
					step={0.1}
					onChange={(e, zoom) => setZoom(zoom)}
					style={sliderStyles}
					ThumbComponent={(props) => <span {...props} style={thumbStyles} />}
					trackStyle={sliderTrackStyles}
					railStyle={sliderRailStyles}
				/>
				<button
					className="save-crop-button"
					type="button"
					onClick={saveCroppedImage}>
					Save
				</button>
			</div>
		</div>
	);
};

export default Modal;
