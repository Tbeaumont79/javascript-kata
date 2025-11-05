import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { getDb, closeDb } from "./config/database";
import { getUser, createUser } from "./controllers/userController";
import { login } from "./controllers/authController";
import { cveUpdateChecker } from "./controllers/cveController";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: {
		error: "Too many requests from this IP address",
		retryAfter: "15 minutes",
		documentation: "https://api.example.com/docs/rate-limits",
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (_, res) => {
		res.status(429).json({
			error: "Rate limit exceeded",
			message: "Too many requests from this IP, please try again later",
			retryAfter: res.get("Retry-After") || 900, // 15 min
		});
	},
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.get("/getUser", async (__, res) => await getUser(res));

app.get("/", async (_req: Request, res: Response) => {
	try {
		res.json({ message: "hello", dbConnected: true });
	} catch (error) {
		console.error("Database connection error:", error);
		res.status(500).json({ message: "Database connection failed", error });
	}
});

app.get("/updateCve", async (_, res) => {
	await cveUpdateChecker(res);
});
app.post("/register", async (req, res) => {
	await createUser(req, res);
});

app.post("/login", async (req, res) => {
	await login(req, res);
});

const server = app.listen(PORT, async () => {
	await getDb();
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
