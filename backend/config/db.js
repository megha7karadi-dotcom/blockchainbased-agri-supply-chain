const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
