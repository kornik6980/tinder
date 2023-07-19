import MatchCard from "./MatchCard";

const Matches = ({ likes, matches, setCurrentChat, id }) => {
	const reversedMatches = matches.slice().reverse();

	return (
		<div>
			<div className="matches-container">
				<div className="likes-container">
					<p>{likes.length}</p>
				</div>
				{reversedMatches.map((match, index) => (
					<div
						key={index}
						onClick={() => {
							const chat = {
								members: [id, match._id],
							};
							setCurrentChat(chat);
						}}>
						<MatchCard
							picture={match.profile_pictures_path[0]}
							name={match.first_name}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default Matches;
