const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.info(`[AgriTrace] MongoDB connection notice: ${error.message}. Running in fallback mode.`);
    return null;
  }
};

module.exports = connectDB;
