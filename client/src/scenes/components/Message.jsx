import moment from "moment";
import UserImage from "./UserImage";

const Message = ({ message, own, user }) => {
	return (
		<div className={own ? "message own" : "message"}>
			<div className="message-top">
				{!own && user && (
					<UserImage image={user.profile_pictures_path[0]} size={50} />
				)}
				<p className="message-text">{message.content}</p>
			</div>
			<div className="message-bottom">
				{moment(message.createdAt).fromNow()}
			</div>
		</div>
	);
};

export default Message;
