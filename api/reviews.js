// api/reviews.js
// Vercel Serverless Function for Guest Reviews in MongoDB Atlas

const { connectToDatabase } = require('./db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('reviews');

    if (req.method === 'GET') {
      const reviews = await collection.find({}).sort({ createdAt: -1 }).limit(50).toArray();
      return res.status(200).json(reviews);
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!data.guest || !data.comment) {
        return res.status(400).json({ error: 'Guest name and review text are required.' });
      }

      const reviewDoc = {
        guest: data.guest,
        city: data.city || 'Vijayawada',
        dish: data.dish || 'Andhra Meals',
        rating: Number(data.rating) || 5,
        comment: data.comment,
        verified: true,
        createdAt: new Date()
      };

      const result = await collection.insertOne(reviewDoc);

      return res.status(201).json({
        success: true,
        insertedId: result.insertedId,
        review: reviewDoc
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Reviews API Error:', error);
    return res.status(500).json({
      error: 'Database operation failed',
      message: error.message
    });
  }
};
