const express = require('express');
const { nanoid } = require('nanoid');

module.exports = (Order) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { customer_name, customer_email, items, total } = req.body;
    if (!customer_name || !customer_email || !items || !total)
      return res.status(400).json({ error: 'Missing fields' });

    const order = await Order.create({ 
      id: nanoid(10), 
      customer_name, 
      customer_email, 
      items, 
      total
    });
    
    res.json({ ok: true, id: order.id });
  });

  return router;
};
