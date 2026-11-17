const jwt = require('jsonwebtoken');
const storageService = require('../services/storageService');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'skillmatch_dev_jwt_fallback_secret_key_12345';

async function requireAuth(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to continue.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await storageService.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'The account associated with this session no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please sign in again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    logger.warn(`Auth token verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }
}

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = {
  requireAuth,
  generateToken,
};
