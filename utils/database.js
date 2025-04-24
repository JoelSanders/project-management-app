// utils/database.js
import { MongoClient } from 'mongodb';

// Connection URI from environment variables
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!dbName) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

// Cache the database connection to reuse it across requests
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // If no cached connection, create a new one
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db(dbName);

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}