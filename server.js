const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const foodRoutes = require("./config/models/routes/foodRoutes");
const orderRoutes = require("./config/models/routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Smart Canteen API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});