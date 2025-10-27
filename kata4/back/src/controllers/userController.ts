import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";

const saltRounds = 10;

export async function getUser(res: Response) {
	try {
		const user = await User.find({});
		if (!user) {
			return res
				.status(500)
				.json({ message: "error there are no user founded in the DB" });
		}
		return res.status(200).send(user);
	} catch (error) {
		return res.send({ message: "Error when getting user ", error });
	}
}

export async function createUser(req: Request, res: Response) {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res.status(400).json({ message: "You must provide a payload" });
		}

		const { username, email, roles, password } = req.body;

		if (!username || !email || !password) {
			return res
				.status(400)
				.json({ message: "Username and email and password are required" });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(409)
				.json({ message: "User with this email already exists" });
		}
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		const newUser = new User({
			username,
			email,
			password: hashedPassword,
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
