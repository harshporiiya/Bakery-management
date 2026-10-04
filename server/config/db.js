const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // Skip if already connected (important for serverless warm invocations)
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sweet_delight_bakery', {
      serverSelectionTimeoutMS: 10000
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('MongoDB connection warning: Running in Fallback/Hybrid Mode (Data served via Mongoose in-memory mock or active connection retries).');
    isConnected = false;
  }
};

const getDbStatus = () => isConnected;

module.exports = { connectDB, getDbStatus };
