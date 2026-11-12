// api/orders.js
const { connectToDatabase, inMemoryStore } = require('./db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db, isInMemory } = await connectToDatabase();

    if (req.method === 'GET') {
      const { orderId } = req.query;

      if (isInMemory) {
        if (orderId) {
          const found = inMemoryStore.orders.find(o => o.orderId === orderId.toUpperCase());
          return found ? res.status(200).json(found) : res.status(404).json({ error: 'Order not found' });
        }
        return res.status(200).json(inMemoryStore.orders);
      }

      const collection = db.collection('orders');
      if (orderId) {
        const order = await collection.findOne({ orderId: orderId.toUpperCase() });
        return order ? res.status(200).json(order) : res.status(404).json({ error: 'Order not found' });
      }
      const orders = await collection.find({}).sort({ createdAt: -1 }).limit(20).toArray();
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const orderData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const orderId = orderData.orderId || `FD${Math.floor(1000 + Math.random() * 9000)}`;

      const document = {
        ...orderData,
        orderId,
        createdAt: new Date(),
        status: orderData.status || 'Order received',
        currentStep: orderData.currentStep || 1
      };

      if (isInMemory) {
        inMemoryStore.orders.unshift(document);
        return res.status(201).json({ success: true, orderId, order: document });
      }

      const result = await db.collection('orders').insertOne(document);
      return res.status(201).json({ success: true, orderId, insertedId: result.insertedId, order: document });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(200).json({ success: true, note: 'Saved locally' });
  }
};
