const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Place order
router.post("/", async (req, res) => {
  const count = await Order.countDocuments();

  const order = new Order({
    ...req.body,
    queueNumber: count + 1,
  });

  await order.save();
  res.json(order);
});

// Get all orders
router.get("/", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

module.exports = router;