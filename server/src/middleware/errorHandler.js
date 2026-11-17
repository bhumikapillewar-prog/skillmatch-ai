const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds the 5 MB limit. Please upload a smaller document.',
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
  }

  // Handle document format or validation errors
  if (err.message && err.message.includes('Unsupported file format')) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      error: `An account with that ${field} already exists.`,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: messages.join('. '),
    });
  }

  // Log error without leaking client PII
  logger.error(`Unhandled Server Error: ${err.message}`);

  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    success: false,
    error: isDev ? err.message : 'An unexpected error occurred. Please try again later.',
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;
