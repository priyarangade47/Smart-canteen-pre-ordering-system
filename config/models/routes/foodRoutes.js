const express = require("express");
const router = express.Router();
const Food = require("../models/Food");

// Get all foods
router.get("/", async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
});

// Add food
router.post("/", async (req, res) => {
  const newFood = new Food(req.body);
  await newFood.save();
  res.json(newFood);
});

module.exports = router;