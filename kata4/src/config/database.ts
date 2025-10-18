import { MongoClient, Db, Collection } from "mongodb";

const url = process.env.MONGODB_URI;
if (!url) {
	throw new Error("MONGODB_URI environment variable is not set");
}

const client = new MongoClient(url);
const dbName = "vul";

let db: Db;
let collection: Collection;

export async function connectDb() {
	await client.connect();
	console.log("Connected successfully to the server");
	db = client.db(dbName);
	collection = db.collection("documents");
}

export function getDb(): Db {
	if (!db) throw new Error("Database not connected");
	return db;
}

export function getCollection(): Collection {
	if (!collection) throw new Error("Database not connected");
	return collection;
}

export async function closeDb() {
	await client.close();
}
