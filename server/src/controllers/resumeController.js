const { parseDocument } = require('../services/documentParser');
const { sanitizeResumeText } = require('../services/piiSanitizer');
const { extractSkillsFromText, extractExperienceYears } = require('../services/aiService');

/**
 * Parses uploaded resume file or pasted text, sanitizes it,
 * and extracts preliminary skills and experience stats for pre-analysis review.
 */
async function parseResumeOnly(req, res, next) {
  try {
    let rawText = '';
    let fileName = 'Pasted Text';
    let format = 'text';

    if (req.file) {
      fileName = req.file.originalname;
      const parsed = await parseDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
      rawText = parsed.text;
      format = parsed.format;
    } else if (req.body.text && req.body.text.trim().length > 30) {
      rawText = req.body.text.trim();
      format = 'pasted';
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please provide a file to parse or at least 30 characters of resume text.',
      });
    }

    const { sanitizedText, redactedItems } = sanitizeResumeText(rawText);
    const skills = extractSkillsFromText(sanitizedText);
    const estimatedYears = extractExperienceYears(sanitizedText);

    res.status(200).json({
      success: true,
      data: {
        fileName,
        format,
        wordCount: sanitizedText.split(/\s+/).filter(Boolean).length,
        redactedItems,
        detectedSkills: {
          technical: skills.tech,
          soft: skills.soft,
        },
        estimatedYears,
        previewText: sanitizedText.slice(0, 1500) + (sanitizedText.length > 1500 ? '...' : ''),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  parseResumeOnly,
};
