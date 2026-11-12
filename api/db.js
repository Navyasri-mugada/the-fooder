// api/db.js
// Optional MongoDB Atlas connection with automatic In-Memory Fallback

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'thefooder';

let cachedClient = null;
let cachedDb = null;

// In-Memory fallback store if MongoDB is not used
const inMemoryStore = {
  orders: [],
  bookings: [],
  reviews: [
    {
      id: "r1",
      guest: "Ravi",
      city: "Vijayawada",
      dish: "Gongura Mutton",
      rating: 5,
      comment: "The gongura mutton is exactly like home. Spicy, sour and worth the wait.",
      verified: true,
      createdAt: new Date()
    },
    {
      id: "r2",
      guest: "Lakshmi",
      city: "Guntur",
      dish: "Andhra Veg Meals",
      rating: 5,
      comment: "We ordered meals for the whole family. Hot, on time and generous with ghee.",
      verified: true,
      createdAt: new Date()
    },
    {
      id: "r3",
      guest: "Srinivas",
      city: "Hyderabad",
      dish: "Pootharekulu & Biryani",
      rating: 4,
      comment: "Best pootharekulu outside Atreyapuram. The biryani is very good too.",
      verified: true,
      createdAt: new Date()
    }
  ]
};

async function connectToDatabase() {
  if (!uri) {
    // Graceful fallback: No MongoDB required!
    return { client: null, db: null, isInMemory: true, inMemoryStore };
  }

  try {
    const { MongoClient, ServerApiVersion } = require('mongodb');

    if (cachedClient && cachedDb) {
      return { client: cachedClient, db: cachedDb, isInMemory: false };
    }

    const client = new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
      maxPoolSize: 10,
      connectTimeoutMS: 4000,
    });

    await client.connect();
    const db = client.db(dbName);
    cachedClient = client;
    cachedDb = db;
    return { client, db, isInMemory: false };
  } catch (err) {
    console.warn("MongoDB connection failed, using in-memory store:", err.message);
    return { client: null, db: null, isInMemory: true, inMemoryStore };
  }
}

module.exports = { connectToDatabase, inMemoryStore };
