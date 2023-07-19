import { useEffect, useState } from "react";
import Carousel from "./Carousel";

const Card = ({ profile, isDragged }) => {
	const [images, setImages] = useState([]);
	const { first_name, bio, date_of_birth, profile_pictures_path } = profile;

	const calculateAge = (date_of_birth) => {
		const now = new Date();
		const birthDate = new Date(date_of_birth);
		const diff = now - birthDate.getTime();
		const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
		return age;
	};
	const age = calculateAge(date_of_birth);

	const fetchImages = async () => {
		const imagePromises = profile_pictures_path.map(async (picture) => {
			const response = await fetch(`http://localhost:3001/assets/${picture}`);
			const blob = await response.blob();
			return URL.createObjectURL(blob);
		});

		const resolvedImages = await Promise.all(imagePromises);
		setImages(resolvedImages);
	};

	useEffect(() => {
		fetchImages();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div>
			<Carousel
				images={images}
				isDragged={isDragged}
				name={first_name}
				age={age}
				bio={bio}
			/>
		</div>
	);
};

export default Card;
