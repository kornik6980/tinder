import mongoose from "mongoose";

const SwipeSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		swiped_user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		swipe_direction: {
			type: String,
			enum: ["left", "right"],
			required: true,
		},
	},
	{ timestamps: true }
);

const Swipe = mongoose.model("Swipe", SwipeSchema);
export default Swipe;
