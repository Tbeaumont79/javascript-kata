import { Request, Response } from "express";
import userModel from "../models/userModel";

export default async function createUser(req: Request, res: Response) {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res.status(400).json({ message: "You must provide a payload" });
		}

		const { username, email, roles } = req.body;

		if (!username || !email) {
			return res
				.status(400)
				.json({ message: "Username and email are required" });
		}

		const existingUser = await userModel.findOne({ email });
		if (existingUser) {
			return res
				.status(409)
				.json({ message: "User with this email already exists" });
		}

		const newUser = new userModel({
			username,
			email,
			roles: roles || "member",
		});

		await newUser.save();

		return res.status(201).json({
			message: "User created successfully",
			data: {
				id: newUser.id,
				username: newUser.username,
				email: newUser.email,
				roles: newUser.roles,
			},
		});
	} catch (error) {
		console.error("Error creating user:", error);
		return res.status(500).json({
			message: "Internal server error",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}
