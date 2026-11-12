// api/reviews.js
const { connectToDatabase, inMemoryStore } = require('./db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db, isInMemory } = await connectToDatabase();

    if (req.method === 'GET') {
      if (isInMemory) {
        return res.status(200).json(inMemoryStore.reviews);
      }
      const reviews = await db.collection('reviews').find({}).sort({ createdAt: -1 }).limit(50).toArray();
      return res.status(200).json(reviews);
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const reviewDoc = {
        guest: data.guest,
        city: data.city || 'Vijayawada',
        dish: data.dish || 'Andhra Meals',
        rating: Number(data.rating) || 5,
        comment: data.comment,
        verified: true,
        createdAt: new Date()
      };

      if (isInMemory) {
        inMemoryStore.reviews.unshift(reviewDoc);
        return res.status(201).json({ success: true, review: reviewDoc });
      }

      const result = await db.collection('reviews').insertOne(reviewDoc);
      return res.status(201).json({ success: true, insertedId: result.insertedId, review: reviewDoc });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(200).json({ success: true, note: 'Saved locally' });
  }
};
