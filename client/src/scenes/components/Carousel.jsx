import React, { useState } from "react";

const Carousel = ({ images, isDragged, name, age, bio, isProfile = false }) => {
	const [currentSlide, setCurrentSlide] = useState(0);

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
		if (isDragged) return;
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
		<div>
			<div className={`${isProfile ? "profile-carousel" : "carousel"}`}>
				<div className="carousel-dots">
					{images.map((_, index) => (
						<span
							key={index}
							className={`carousel-dot ${
								index === currentSlide ? "active" : ""
							}`}
							onClick={() => goToSlide(index)}
							style={{ width: `${95 / images.length}%` }}></span>
					))}
				</div>
				<img
					className={`${isProfile ? "profile-carousel-img" : "carousel-image"}`}
					src={images[currentSlide]}
					alt={`Slide ${currentSlide + 1}`}
					onMouseUp={handleClick}
					draggable="false"
				/>
			</div>
			{isProfile === false && (
				<div className="card-info">
					<div style={{ width: "100%", margin: "2rem 1rem" }}>
						<p style={{ margin: "0" }}>
							<span style={{ fontWeight: "bolder", fontSize: "30px" }}>
								{name}
							</span>
							{"  "}
							<span style={{ fontSize: "22px" }}>{age}</span>
						</p>
						{currentSlide === 1 && (
							<p
								style={{
									width: "95%",
									overflow: "hidden",
									textOverflow: "ellipsis",
									margin: "0",
									display: "-webkit-box",
									WebkitBoxOrient: "vertical",
									WebkitLineClamp: 6,
									maxHeight: "6em",
								}}>
								{bio}
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Carousel;
