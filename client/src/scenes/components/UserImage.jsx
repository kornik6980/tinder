const UserImage = ({ image, size = 35 }) => {
	const divStyle = {
		width: `${size}px`,
		height: `${size}px`,
	};

	return (
		<div style={divStyle}>
			<img
				style={{ objectFit: "cover", borderRadius: "50%" }}
				width={size}
				height={size}
				src={`http://localhost:3001/assets/${image}`}
				alt=""
			/>
		</div>
	);
};

export default UserImage;
