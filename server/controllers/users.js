import User from "../models/User.js";
import Swipe from "../models/Swipe.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export const getUser = async (req, res) => {
	try {
		const { user_id } = req.params;
		const user = await User.findById(user_id);
		res.status(200).json(user);
	} catch (err) {
		res.status(404).json({ message: err.message });
	}
};

export const getUserMatches = async (req, res) => {
	try {
		const { user_id } = req.params;
		const user = await User.findById(user_id);

		const matchedUsers = await Promise.all(
			user.matches.map((id) => User.findById(id))
		);
		const formattedMatchedUsers = matchedUsers.map(
			({
				_id,
				first_name,
				gender,
				date_of_birth,
				bio,
				profile_pictures_path,
			}) => {
				return {
					_id,
					first_name,
					gender,
					date_of_birth,
					bio,
					profile_pictures_path,
				};
			}
		);
		res.status(200).json(formattedMatchedUsers);
	} catch (err) {
		res.status(404).json({ message: err.message });
	}
};

export const addRemoveUserMatch = async (req, res) => {
	try {
		const { user_id, matchedUser_id } = req.params;
		const user = await User.findById(user_id);
		const matchedUser = await User.findById(matchedUser_id);
		if (user.matches.includes(matchedUser_id)) {
			user.matches = user.matches.filter((id) => id !== matchedUser_id);
			matchedUser.matches = matchedUser.matches.filter((id) => id !== user_id);
		} else {
			user.matches.push(matchedUser_id);
			matchedUser.matches.push(user_id);
		}
		await user.save();
		await matchedUser.save();

		const matchedUsers = await Promise.all(
			user.matches.map((id) => User.findById(id))
		);
		const formattedMatchedUsers = matchedUsers.map(
			({
				_id,
				first_name,
				gender,
				date_of_birth,
				bio,
				profile_pictures_path,
			}) => {
				return {
					_id,
					first_name,
					gender,
					date_of_birth,
					bio,
					profile_pictures_path,
				};
			}
		);
		res.status(200).json(formattedMatchedUsers);
	} catch (err) {
		res.status(404).json({ message: err.message });
	}
};

export const getProfiles = async (req, res) => {
	try {
		const { id, desiredGender, gender, min, max } = req.query;

		const swiped = await Swipe.find({ user_id: id });
		const excluded_id = swiped.map(({ swiped_user_id }) => swiped_user_id);

		const currentDate = new Date();
		const minBirthDate = new Date(
			currentDate.getFullYear() - max,
			currentDate.getMonth(),
			currentDate.getDate()
		);
		const maxBirthDate = new Date(
			currentDate.getFullYear() - min,
			currentDate.getMonth(),
			currentDate.getDate()
		);

		const profiles = await User.find({
			_id: { $ne: id, $nin: excluded_id },
			...(desiredGender !== "both" ? { gender: desiredGender } : {}),
			$or: [
				{ "show_me.desired_gender": "both" },
				{ "show_me.desired_gender": gender },
			],
			date_of_birth: {
				$lte: maxBirthDate,
				$gte: minBirthDate,
			},
		});

		if (profiles) {
			const formattedProfiles = profiles.map(
				({
					_id,
					first_name,
					gender,
					date_of_birth,
					bio,
					profile_pictures_path,
				}) => {
					return {
						_id,
						first_name,
						gender,
						date_of_birth,
						bio,
						profile_pictures_path,
					};
				}
			);
			return res.status(200).json(formattedProfiles);
		}

		res.status(404).json({ message: "no profiles found" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const updateUserPreferences = async (req, res) => {
	try {
		const { user_id } = req.params;
		const { min, max, desiredGender } = req.body;
		const user = await User.findById(user_id);
		if (!user) {
			return res.status(404).json({ message: "User does not exist. " });
		}
		user.show_me.age_range.min = min;
		user.show_me.age_range.max = max;
		user.show_me.desired_gender = desiredGender;
		await user.save();
		res.status(200).json(user);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

export const updateUserProfile = async (req, res) => {
	try {
		const { user_id } = req.params;
		const fileNames = req.files.map((file) => file.filename);
		const bio = req.body.bio;
		const user = await User.findById(user_id);
		if (!user) {
			return res.status(404).json({ message: "User does not exist. " });
		}
		user.bio = bio;
		user.profile_pictures_path = fileNames;
		await user.save();
		res.status(200).json(user);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

export const deleteUser = async (req, res) => {
	try {
		const { user_id } = req.params;
		await User.findByIdAndRemove(user_id);
		await Swipe.deleteMany({
			$or: [{ user_id: user_id }, { swiped_user_id: user_id }],
		});
		const deletedChat = await Chat.findByIdAndRemove({
			members: { $in: user_id },
		});
		await Message.deleteMany({ chat_id: deletedChat._id });
		await User.updateMany(
			{ matches: { $in: user_id } },
			{ $pull: { matches: user_id } }
		);
		res
			.status(200)
			.json({ message: "User and all its instances deleted successfully." });
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};
