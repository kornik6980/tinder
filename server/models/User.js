import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		first_name: {
			type: String,
			required: true,
			min: 2,
			max: 25,
		},
		email: {
			type: String,
			required: true,
			max: 50,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		gender: {
			type: String,
			enum: ["male", "female"],
			required: true,
		},
		show_me: {
			desired_gender: {
				type: String,
				enum: ["male", "female", "both"],
			},
			age_range: {
				min: {
					type: Number,
					default: 18,
					min: 18,
					max: 99,
				},
				max: {
					type: Number,
					default: 22,
					min: 18,
					max: 99,
				},
			},
		},
		date_of_birth: {
			type: Date,
			required: true,
		},
		bio: {
			type: String,
			required: true,
		},
		matches: {
			type: Array,
			default: [],
		},
		profile_pictures_path: { type: Array, required: true },
	},
	{ timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
