// db.js
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
	throw new Error("MONGODB_URI is not defined in environment variables");
}

// Create a single shared client instance for the whole app
const client = new MongoClient(uri, {
	// Strong defaults for production readiness
	maxPoolSize: 10, // limit concurrent connections from this app
	minPoolSize: 0,
	serverSelectionTimeoutMS: 5000, // fail fast if server not reachable
	socketTimeoutMS: 20000, // time out long-running operations
});

let cachedDb: Db | null = null;

/**
 * Connects to MongoDB and returns the db handle.
 * Ensures only one connection is established and reused.
 */
export async function getDb() {
	if (cachedDb) return cachedDb;

	try {
		await client.connect(); // establishes the pool
		const db = client.db(dbName);
		cachedDb = db;
		return db;
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
		await client.close();
		cachedDb = null;
	} catch (err) {
		console.error("Error closing MongoDB client:", err);
	}
}
