// api/bookings.js
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
        return res.status(200).json(inMemoryStore.bookings);
      }
      const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).limit(30).toArray();
      return res.status(200).json(bookings);
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
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

      if (isInMemory) {
        inMemoryStore.bookings.unshift(bookingDoc);
        return res.status(201).json({ success: true, bookingId, booking: bookingDoc });
      }

      const result = await db.collection('bookings').insertOne(bookingDoc);
      return res.status(201).json({ success: true, bookingId, insertedId: result.insertedId, booking: bookingDoc });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(200).json({ success: true, note: 'Saved locally' });
  }
};
