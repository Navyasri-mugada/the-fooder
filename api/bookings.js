// api/bookings.js
// Vercel Serverless Function for Table Reservations in MongoDB Atlas

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
    const collection = db.collection('bookings');

    if (req.method === 'GET') {
      const { branch } = req.query;
      const query = branch ? { branch } : {};
      const bookings = await collection.find(query).sort({ createdAt: -1 }).limit(30).toArray();
      return res.status(200).json(bookings);
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!data.name || !data.phone || !data.branch || !data.date) {
        return res.status(400).json({ error: 'Name, 10-digit phone, branch, and date are required.' });
      }

      const bookingId = data.bookingId || `TB-${Math.floor(1000 + Math.random() * 9000)}`;

      const bookingDoc = {
        bookingId,
        name: data.name,
        phone: data.phone,
        branch: data.branch,
        guests: data.guests || 2,
        date: data.date,
        time: data.time || '01:00 PM',
        notes: data.notes || '',
        status: 'Pending Confirmation Call',
        createdAt: new Date()
      };

      const result = await collection.insertOne(bookingDoc);

      return res.status(201).json({
        success: true,
        bookingId,
        insertedId: result.insertedId,
        booking: bookingDoc
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Bookings API Error:', error);
    return res.status(500).json({
      error: 'Database operation failed',
      message: error.message
    });
  }
};
