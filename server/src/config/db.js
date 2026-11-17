const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnected = false;

/**
 * Connects to MongoDB database with graceful timeout and reconnection logic.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmatch';

  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000,
    };

    mongoose.connection.on('connected', () => {
      isConnected = true;
      logger.info('MongoDB connected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.warn(`MongoDB runtime connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected.');
    });

    const conn = await mongoose.connect(uri, opts);
    isConnected = true;
    logger.info(`MongoDB connected to host: ${conn.connection.host || 'local'}`);
    return conn;
  } catch (error) {
    logger.warn(`Initial MongoDB connection failed (${error.message}). Running in mock/in-memory mode for offline evaluation.`);
    // Return null or connection placeholder so server can continue without crashing
    return null;
  }
}

function getConnectionStatus() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
  };
}

module.exports = {
  connectDB,
  getConnectionStatus,
};
