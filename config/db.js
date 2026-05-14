const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URI || "mongodb://localhost:27017/project1r";
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;