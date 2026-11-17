const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { parseResumeOnly } = require('../controllers/resumeController');

router.use(requireAuth);

// Parse and preview resume text and detected skills
router.post('/preview', upload.single('resume'), parseResumeOnly);

module.exports = router;
