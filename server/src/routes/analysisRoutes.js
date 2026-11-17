const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { analysisLimiter } = require('../middleware/rateLimiter');
const {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
  clearAllAnalyses,
  exportAnalysisReport,
} = require('../controllers/analysisController');

// All analysis routes require authentication
router.use(requireAuth);

// Create analysis: supports multipart form with single file 'resume' OR json body
router.post('/', analysisLimiter, upload.single('resume'), createAnalysis);

// List all analyses for current user
router.get('/', getAnalyses);

// Clear all analyses for current user
router.delete('/clear-all', clearAllAnalyses);

// Specific analysis by ID
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);
router.get('/:id/export', exportAnalysisReport);

module.exports = router;
