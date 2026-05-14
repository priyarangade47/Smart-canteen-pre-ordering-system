const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: String,
  price: Number,
  prepTime: Number,
});

module.exports = mongoose.model("Food", foodSchema);