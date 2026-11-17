const { parseDocument } = require('../services/documentParser');
const { sanitizeResumeText } = require('../services/piiSanitizer');
const { performMatchAnalysis } = require('../services/aiService');
const storageService = require('../services/storageService');
const logger = require('../utils/logger');

/**
 * Run resume vs job description analysis and save report
 */
async function createAnalysis(req, res, next) {
  try {
    const userId = req.user._id;
    const {
      jobDescription,
      jobTitle = 'Target Role',
      jobCompany = '',
      resumeText: rawPastedText,
      resumeSource = 'file_upload',
    } = req.body;

    // Validate Job Description
    if (!jobDescription || jobDescription.trim().length < 40) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a comprehensive job description (at least 40 characters) to analyze.',
      });
    }

    let resumeText = '';
    let resumeFileName = 'Pasted Resume';
    let resumeFormat = 'pasted';

    // 1. Process Uploaded File OR Pasted Text
    if (req.file) {
      resumeFileName = req.file.originalname;
      const parsed = await parseDocument(req.file.buffer, req.file.mimetype, req.file.originalname);
      resumeText = parsed.text;
      resumeFormat = parsed.format;
    } else if (rawPastedText && rawPastedText.trim().length >= 40) {
      resumeText = rawPastedText.trim();
      resumeFormat = 'pasted';
      resumeFileName = 'pasted-resume.txt';
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please upload a resume file (PDF, DOCX, TXT) or paste your resume text (at least 40 characters).',
      });
    }

    // 2. Sanitize PII before AI processing
    const { sanitizedText, redactedItems } = sanitizeResumeText(resumeText);

    logger.info(`Initiating analysis for user ID ${userId}. PII Redacted: ${JSON.stringify(redactedItems)}`);

    // 3. Perform AI Match Analysis
    const analysisResult = await performMatchAnalysis(sanitizedText, jobDescription.trim());

    // 4. Calculate automated retention expiry (90 days)
    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '90', 10);
    const expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);

    // 5. Construct analysis record
    const recordPayload = {
      user: userId,
      jobTitle: jobTitle && jobTitle !== 'Target Role' ? jobTitle.trim() : (analysisResult.targetJobTitle || 'Target Position'),
      jobCompany: jobCompany ? jobCompany.trim() : '',
      jobDescriptionSummary: jobDescription.trim().slice(0, 300) + (jobDescription.length > 300 ? '...' : ''),
      resumeSource: req.file ? 'file_upload' : 'text_paste',
      resumeFileName,
      resumeFormat,
      overallScore: analysisResult.overallScore,
      tier: analysisResult.tier,
      badgeColor: analysisResult.badgeColor,
      formulaExplanation: analysisResult.formulaExplanation,
      categoryBreakdown: analysisResult.categoryBreakdown,
      matchedSkills: analysisResult.matchedSkills,
      missingSkills: analysisResult.missingSkills,
      matchedSoftSkills: analysisResult.matchedSoftSkills,
      missingSoftSkills: analysisResult.missingSoftSkills,
      experienceAnalysis: analysisResult.experienceAnalysis,
      suggestions: analysisResult.suggestions,
      engine: analysisResult.engine,
      sanitizationReport: {
        emailsRedacted: redactedItems.emails,
        phonesRedacted: redactedItems.phones,
        addressesRedacted: redactedItems.addresses,
      },
      disclaimer: analysisResult.disclaimer,
      expiresAt,
    };

    const savedRecord = await storageService.createAnalysis(recordPayload);

    logger.info(`Analysis completed successfully. Record ID: ${savedRecord._id}, Score: ${savedRecord.overallScore}/100`);

    res.status(201).json({
      success: true,
      message: 'Analysis completed successfully.',
      data: {
        analysis: savedRecord,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all analyses for the current authenticated user
 */
async function getAnalyses(req, res, next) {
  try {
    const userId = req.user._id;
    const { search = '', sort = 'desc' } = req.query;

    const list = await storageService.getAnalysesByUser(userId, { search, sort });

    res.status(200).json({
      success: true,
      count: list.length,
      data: {
        analyses: list,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single analysis by ID
 */
async function getAnalysisById(req, res, next) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const item = await storageService.getAnalysisById(id, userId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Analysis report not found or you do not have permission to view it.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        analysis: item,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a specific analysis
 */
async function deleteAnalysis(req, res, next) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const success = await storageService.deleteAnalysis(id, userId);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found or could not be deleted.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Analysis report deleted permanently.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete all analyses for the user
 */
async function clearAllAnalyses(req, res, next) {
  try {
    const userId = req.user._id;
    const count = await storageService.clearUserAnalyses(userId);

    res.status(200).json({
      success: true,
      message: `Cleared ${count} analyses successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Export analysis as structured printable report or JSON
 */
async function exportAnalysisReport(req, res, next) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const item = await storageService.getAnalysisById(id, userId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found.',
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="SkillMatch-Report-${item.jobTitle.replace(/\s+/g, '_')}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(item, null, 2));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
  clearAllAnalyses,
  exportAnalysisReport,
};
