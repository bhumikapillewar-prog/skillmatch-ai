const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  deleteAccount,
  getPrivacyPolicy,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/privacy', getPrivacyPolicy);

// Protected routes
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.delete('/account', requireAuth, deleteAccount);

module.exports = router;
