// api/db.js
// MongoDB Atlas Connection Handler with Serverless Connection Caching

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'thefooder';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // If MongoDB URI is not set, throw informative error
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing. Please set it in Vercel or your .env file.');
  }

  // Reuse existing connection if alive
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 10,
    connectTimeoutMS: 5000,
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = { connectToDatabase };
