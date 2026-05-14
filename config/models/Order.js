const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: Array,
  totalPrice: Number,
  status: {
    type: String,
    default: "Pending",
  },
  queueNumber: Number,
});

module.exports = mongoose.model("Order", orderSchema);