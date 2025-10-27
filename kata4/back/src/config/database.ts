import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
	throw new Error("MONGODB_URI is not defined in environment variables");
}

/**
 * Connects to MongoDB using Mongoose.
 * Ensures only one connection is established and reused.
 */
export async function getDb() {
	if (mongoose.connection.readyState === 1) {
		console.log("MongoDB already connected");
		return mongoose.connection;
	}

	try {
		await mongoose.connect(uri as string, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 20000,
		});
		console.log("MongoDB connected successfully");
		return mongoose.connection;
	} catch (err) {
		console.error("MongoDB connection error:", err);
		throw err;
	}
}

/**
 * Gracefully close the connection pool (e.g., on server shutdown).
 */
export async function closeDb() {
	try {
		await mongoose.connection.close();
		console.log("MongoDB connection closed");
	} catch (err) {
		console.error("Error closing MongoDB connection:", err);
	}
}
