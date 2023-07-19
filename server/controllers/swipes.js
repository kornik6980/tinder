import Swipe from "../models/Swipe.js";
import User from "../models/User.js";

export const addSwipe = async (req, res) => {
	try {
		const { user_id, swiped_user_id, swipe_direction } = req.body;
		if (swipe_direction === "right") {
			const matchedUserSwipe = await Swipe.findOneAndUpdate(
				{
					user_id: swiped_user_id,
					swiped_user_id: user_id,
					swipe_direction: "right",
				},
				{ swipe_direction: "left" },
				{ new: true }
			);
			if (matchedUserSwipe) {
				const newSwipe = new Swipe({
					user_id,
					swiped_user_id,
					swipe_direction: "left",
				});

				await newSwipe.save();

				const user = await User.findById(user_id);
				const matchedUser = await User.findById(swiped_user_id);
				user.matches.push(swiped_user_id);
				matchedUser.matches.push(user_id);
				await user.save();
				await matchedUser.save();

				return res
					.status(201)
					.json({ message: "matching swipe found, match created" });
			}
		}
		const newSwipe = new Swipe({
			user_id,
			swiped_user_id,
			swipe_direction,
		});

		await newSwipe.save();
		res.status(201).json({ message: "swipe created" });
	} catch (err) {
		res.status(409).json({ message: err.message });
	}
};

export const getSwipes = async (req, res) => {
	try {
		const { user_id } = req.params;
		const swipes = await Swipe.find({ swiped_user_id: user_id });
		res.status(200).json(swipes);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
