const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
      default: 'Target Role',
    },
    jobCompany: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      default: '',
    },
    jobDescriptionSummary: {
      type: String,
      trim: true,
      maxlength: [1000, 'Summary exceeds limit'],
      default: '',
    },
    resumeSource: {
      type: String,
      enum: ['file_upload', 'text_paste'],
      default: 'file_upload',
    },
    resumeFileName: {
      type: String,
      default: 'pasted-resume.txt',
    },
    resumeFormat: {
      type: String,
      enum: ['pdf', 'docx', 'txt', 'text-fallback', 'pasted'],
      default: 'pdf',
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    tier: {
      type: String,
      required: true,
    },
    badgeColor: {
      type: String,
      default: 'blue',
    },
    formulaExplanation: {
      type: String,
      required: true,
    },
    categoryBreakdown: {
      technicalSkills: {
        label: { type: String, default: 'Core Technical Competencies' },
        weight: { type: Number, default: 40 },
        score: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        matchedCount: { type: Number, default: 0 },
        missingCount: { type: Number, default: 0 },
        explanation: { type: String, default: '' },
      },
      experienceDepth: {
        label: { type: String, default: 'Experience Depth & Seniority' },
        weight: { type: Number, default: 30 },
        score: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        candidateYears: { type: Number, default: 0 },
        targetYears: { type: Number, default: 0 },
        explanation: { type: String, default: '' },
      },
      domainSoftSkills: {
        label: { type: String, default: 'Domain Knowledge & Collaboration' },
        weight: { type: Number, default: 20 },
        score: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        matchedCount: { type: Number, default: 0 },
        missingCount: { type: Number, default: 0 },
        explanation: { type: String, default: '' },
      },
      educationAndCerts: {
        label: { type: String, default: 'Education & Certifications' },
        weight: { type: Number, default: 10 },
        score: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        explanation: { type: String, default: '' },
      },
    },
    matchedSkills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'Technical' },
        verifiedInResume: { type: Boolean, default: true },
      },
    ],
    missingSkills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'Technical' },
        required: { type: Boolean, default: true },
      },
    ],
    matchedSoftSkills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'Domain / Soft' },
      },
    ],
    missingSoftSkills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'Domain / Soft' },
      },
    ],
    experienceAnalysis: {
      summary: { type: String, default: '' },
      candidateYears: { type: Number, default: 0 },
      targetYears: { type: Number, default: 0 },
      alignmentLevel: { type: String, default: 'Moderate' },
      highlightedStrengths: [{ type: String }],
      potentialGaps: [{ type: String }],
    },
    suggestions: [
      {
        category: { type: String, required: true },
        action: { type: String, required: true },
        rationale: { type: String, required: true },
        priority: {
          type: String,
          enum: ['High', 'Medium', 'Low'],
          default: 'Medium',
        },
      },
    ],
    engine: {
      type: String,
      default: 'deterministic-nlp',
    },
    sanitizationReport: {
      emailsRedacted: { type: Number, default: 0 },
      phonesRedacted: { type: Number, default: 0 },
      addressesRedacted: { type: Number, default: 0 },
    },
    disclaimer: {
      type: String,
      default: 'SkillMatch AI recommendations are advisory and grounded in the input text. No hiring guarantees are made.',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    // Optional automated deletion date based on retention settings (e.g. 90 days)
    expiresAt: {
      type: Date,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user query sorting
analysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
