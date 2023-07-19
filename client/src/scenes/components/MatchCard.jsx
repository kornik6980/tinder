const MatchCard = ({ picture, name }) => {
	return (
		<div className="match-card-container">
			<div className="match-card-content">
				<img
					draggable="false"
					src={`http://localhost:3001/assets/${picture}`}
					alt=""
				/>
				<p>{name}</p>
			</div>
		</div>
	);
};

export default MatchCard;
