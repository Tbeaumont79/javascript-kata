import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";

export async function login(req: Request, res: Response) {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res.status(400).json({ message: "You must provide a payload" });
		}

		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		// Sélectionne explicitement le mot de passe avec select('+password')
		const user = await User.findOne({ email }).select("+password");

		if (!user || !user.password) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Compare le mot de passe hashé
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Retourne l'utilisateur sans le mot de passe
		return res.status(200).json({
			message: "Login successful",
			data: {
				id: user.id,
				username: user.username,
				email: user.email,
				roles: user.roles,
			},
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			message: "Internal server error",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}
