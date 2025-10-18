import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
	res.json({ message: "hello" });
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
