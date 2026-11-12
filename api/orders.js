// api/orders.js
// Vercel Serverless Function for Food Orders in MongoDB Atlas

const { connectToDatabase } = require('./db');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('orders');

    if (req.method === 'GET') {
      const { orderId } = req.query;

      if (orderId) {
        const order = await collection.findOne({ orderId: orderId.toUpperCase() });
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
        return res.status(200).json(order);
      }

      // Return recent 20 orders
      const orders = await collection.find({}).sort({ createdAt: -1 }).limit(20).toArray();
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const orderData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!orderData || !orderData.items || orderData.items.length === 0) {
        return res.status(400).json({ error: 'Order must contain items.' });
      }

      // Generate realistic Order ID if not already provided (e.g. FD4821)
      const orderId = orderData.orderId || `FD${Math.floor(1000 + Math.random() * 9000)}`;

      const document = {
        ...orderData,
        orderId,
        createdAt: new Date(),
        status: orderData.status || 'Order received',
        currentStep: orderData.currentStep || 1
      };

      const result = await collection.insertOne(document);
      return res.status(201).json({
        success: true,
        orderId,
        insertedId: result.insertedId,
        order: document
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({
      error: 'Database operation failed',
      message: error.message
    });
  }
};
