import { Request, Response } from "express";

export default async function createUser(req: Request, res: Response) {
	console.log("Headers:", req.headers["content-type"]);
	console.log("Body:", req.body);
	console.log("Params:", req.params);

	if (!req.body || Object.keys(req.body).length === 0) {
		return res
			.status(400)
			.json({ message: "You must provide a payload" });
	}
	return res.status(201).json({ message: "User created successfully", data: req.body });
}
