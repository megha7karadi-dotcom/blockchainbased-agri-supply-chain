const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from backend/.env (override: true ensures PORT=5000 is used)
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Enable express.json()
app.use(express.json());

// Health endpoint
app.get('/api/health', async (req, res) => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    return res.status(200).json({
      status: 'ok',
      database: 'connected'
    });
  } else {
    return res.status(503).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});

// Connect to MongoDB when the server starts
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
