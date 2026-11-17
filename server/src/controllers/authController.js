const storageService = require('../services/storageService');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { name, email, password, headline } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.',
      });
    }

    const existing = await storageService.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const user = await storageService.createUser({
      name: name.trim(),
      email: email.trim(),
      password,
      headline: headline ? headline.trim() : '',
    });

    const token = generateToken(user._id);

    logger.info(`User registered successfully: [REDACTED_EMAIL]`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log in an existing user
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password.',
      });
    }

    const user = await storageService.findUserByEmail(email, true);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id);
    const safeUser = user.toSafeObject ? user.toSafeObject() : user;

    logger.info(`User signed in successfully: [REDACTED_EMAIL]`);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user profile
 */
async function getMe(req, res) {
  res.status(200).json({
    success: true,
    data: {
      user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
    },
  });
}

/**
 * Update user profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, headline, allowAnonymousBenchmarking } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (headline !== undefined) updates.headline = headline.trim();
    if (allowAnonymousBenchmarking !== undefined) {
      updates['privacyConsent.allowAnonymousBenchmarking'] = Boolean(allowAnonymousBenchmarking);
    }

    const updatedUser = await storageService.updateUser(req.user._id, updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete account and all associated analyses (Right to be Forgotten)
 */
async function deleteAccount(req, res, next) {
  try {
    const userId = req.user._id;
    await storageService.deleteUser(userId);

    logger.info(`User account and analyses permanently deleted for user ID: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Privacy Policy and Data Handling specification endpoint
 */
function getPrivacyPolicy(req, res) {
  res.status(200).json({
    success: true,
    data: {
      storage: {
        method: 'Documents are processed directly in-memory and are never written to unencrypted temporary disk directories.',
        retentionDays: 90,
        automatedPurge: 'Analyses are automatically scheduled for permanent deletion via TTL database indices.',
      },
      piiSanitization: {
        enabled: true,
        scope: ['Phone numbers', 'Physical street addresses', 'Government IDs / SSNs', 'Personal emails'],
        timing: 'Redacted prior to AI processing or logging.',
      },
      aiModelTraining: {
        zeroTrainingPolicy: 'Your résumés and job descriptions are never used to train or fine-tune AI models.',
      },
      userRights: {
        access: 'Users can review all stored analyses at any time in the dashboard.',
        deletion: 'Users can delete individual analyses or their entire account with a single click.',
        export: 'Users can export their complete analysis reports at any time.',
      },
    },
  });
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  deleteAccount,
  getPrivacyPolicy,
};
