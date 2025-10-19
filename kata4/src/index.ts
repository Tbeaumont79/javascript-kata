import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { getDb, closeDb } from "./config/database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get("/", async (_req: Request, res: Response) => {
	try {
		await getDb();
		res.json({ message: "hello", dbConnected: true });
	} catch (error) {
		console.error("Database connection error:", error);
		res.status(500).json({ message: "Database connection failed", error });
	}
});

const server = app.listen(PORT, async () => {
	console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
	console.log("SIGTERM received, closing server...");
	server.close(async () => {
		await closeDb();
		process.exit(0);
	});
});

process.on("SIGINT", async () => {
	console.log("SIGINT received, closing server...");
	server.close(async () => {
		await closeDb();
		process.exit(0);
	});
});
