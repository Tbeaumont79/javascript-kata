import mongoose from "mongoose";
import { randomUUID } from "crypto";

const UserSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			default: () => randomUUID(),
		},
		username: { type: String },
		email: { type: String },
		roles: {
			type: String,
			default: "member",
		},
	},
	{ timestamps: true }
);

const userModel = mongoose.model("User", UserSchema);

export default userModel;
