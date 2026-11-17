/**
 * Unified AI Analysis Service
 * Integrates Google Gemini API with fallback to deterministic NLP analysis.
 * Enforces grounded suggestions, ethical constraints, and strict JSON schemas.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { calculateTransparentScore } = require('./scoringEngine');
const logger = require('../utils/logger');

// Common catalog of tech & industry skills for robust semantic matching
const SKILL_CATALOG = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'react.js', 'react native', 'vue', 'vue.js', 'angular', 'svelte', 'next.js', 'nuxt.js',
  'node.js', 'nodejs', 'express', 'express.js', 'nest.js', 'fastapi', 'django', 'flask', 'spring boot', 'asp.net',
  'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'elasticsearch', 'dynamodb', 'cassandra',
  'docker', 'kubernetes', 'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'terraform', 'ci/cd',
  'git', 'github', 'gitlab', 'graphql', 'rest api', 'restful api', 'microservices', 'kafka', 'rabbitmq',
  'tailwind css', 'tailwind', 'bootstrap', 'sass', 'css3', 'html5', 'webpack', 'vite',
  'jest', 'mocha', 'cypress', 'playwright', 'testing library', 'tdd',
  'agile', 'scrum', 'jira', 'system design', 'architecture', 'devops', 'linux',
];

const SOFT_SKILLS = [
  'cross-functional collaboration', 'collaboration', 'stakeholder management', 'problem solving',
  'mentorship', 'team leadership', 'verbal communication', 'written communication', 'code review',
  'agile ceremonies', 'time management', 'adaptability', 'critical thinking', 'ownership'
];

/**
 * Extracts mentions of skills from text using boundary-safe regex matching
 */
function extractSkillsFromText(text) {
  const lower = text.toLowerCase();
  const foundTech = new Set();
  const foundSoft = new Set();

  for (const skill of SKILL_CATALOG) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;.:/()\\[\\]])${escaped}(?:[\\s,;.:/()\\[\\]]|$)`, 'i');
    if (regex.test(lower)) {
      foundTech.add(skill);
    }
  }

  for (const skill of SOFT_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;.:/()\\[\\]])${escaped}(?:[\\s,;.:/()\\[\\]]|$)`, 'i');
    if (regex.test(lower)) {
      foundSoft.add(skill);
    }
  }

  return {
    tech: Array.from(foundTech),
    soft: Array.from(foundSoft),
  };
}

/**
 * Estimates years of experience from resume or JD text
 */
function extractExperienceYears(text) {
  // Pattern 1: "X+ years of experience" or "X years"
  const patterns = [
    /(\d{1,2})\+?\s*(?:-\s*\d{1,2})?\s*years?(?:\s*of)?\s*(?:experience|working)?/gi,
    /(?:experience|tenure):\s*(\d{1,2})\s*years?/gi,
  ];

  let detected = 0;
  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const yrs = parseInt(match[1], 10);
      if (yrs > detected && yrs < 45) {
        detected = yrs;
      }
    }
  }

  // Pattern 2: Detect year ranges in resume (e.g. 2018 - 2024 or 2020 - Present)
  const yearRangeRegex = /\b(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|present|current)\b/gi;
  let rangeYears = 0;
  let rangeMatch;
  const currentYear = new Date().getFullYear();

  while ((rangeMatch = yearRangeRegex.exec(text)) !== null) {
    const startYear = parseInt(rangeMatch[1], 10);
    const endStr = rangeMatch[2].toLowerCase();
    const endYear = (endStr === 'present' || endStr === 'current') ? currentYear : parseInt(endStr, 10);
    if (endYear >= startYear && endYear <= currentYear + 1) {
      rangeYears += (endYear - startYear);
    }
  }

  return Math.max(detected, Math.min(rangeYears, 35));
}

/**
 * Deterministic NLP Analyzer (Fallback & offline-capable)
 */
function analyzeWithDeterministicNLP(resumeText, jobDescription) {
  logger.info('Performing analysis using Deterministic Semantic NLP Engine...');

  const jdSkills = extractSkillsFromText(jobDescription);
  const resumeSkills = extractSkillsFromText(resumeText);

  // If JD didn't list common tech keywords, extract prominent title words
  const requiredTech = jdSkills.tech.length > 0 ? jdSkills.tech : ['javascript', 'web development', 'apis'];
  const requiredSoft = jdSkills.soft.length > 0 ? jdSkills.soft : ['collaboration', 'problem solving'];

  const matchedTech = requiredTech.filter((s) => resumeSkills.tech.includes(s));
  const missingTech = requiredTech.filter((s) => !resumeSkills.tech.includes(s));

  const matchedSoft = requiredSoft.filter((s) => resumeSkills.soft.includes(s));
  const missingSoft = requiredSoft.filter((s) => !resumeSkills.soft.includes(s));

  const candidateYears = Math.max(1, extractExperienceYears(resumeText));
  const targetYears = extractExperienceYears(jobDescription) || 3;

  // Education match detection
  const eduKeywords = ['bachelor', 'master', 'degree', 'b.s.', 'm.s.', 'b.tech', 'computer science', 'engineering'];
  const hasEdu = eduKeywords.some((k) => resumeText.toLowerCase().includes(k));

  const scoreResult = calculateTransparentScore({
    requiredTechSkills: requiredTech.map((n) => ({ name: n, importance: 'High' })),
    matchedTechSkills: matchedTech,
    missingTechSkills: missingTech,
    candidateYears,
    targetYears,
    matchedSoftSkills: matchedSoft,
    missingSoftSkills: missingSoft,
    educationMatches: hasEdu,
    certificationsMatch: resumeText.toLowerCase().includes('certified') || resumeText.toLowerCase().includes('certification'),
  });

  // Generate grounded, actionable improvement suggestions
  const suggestions = [];

  if (missingTech.length > 0) {
    const topMissing = missingTech.slice(0, 3).join(', ');
    suggestions.push({
      category: 'Key Skill Gaps',
      action: `Explicitly articulate hands-on experience or coursework with ${topMissing}. If you have used these or related tools, add specific projects or bullet points reflecting your proficiency.`,
      rationale: `The job description emphasizes ${topMissing} as critical requirements for this position.`,
      priority: 'High',
    });
  }

  suggestions.push({
    category: 'Impact & Quantification',
    action: 'Convert generic task descriptions into STAR/XYZ bullets (Accomplished [X], as measured by [Y], by doing [Z]).',
    rationale: 'Adding verifiable metrics (e.g., latency reduction, user growth, test coverage) substantially increases recruiter engagement.',
    priority: 'Medium',
  });

  if (missingSoft.length > 0) {
    suggestions.push({
      category: 'Collaboration & Soft Skills',
      action: `Highlight team-oriented accomplishments demonstrating ${missingSoft.slice(0, 2).join(' and ')}.`,
      rationale: 'Hiring managers look for evidence of cross-functional delivery alongside technical mastery.',
      priority: 'Low',
    });
  }

  // Experience assessment
  const experienceAnalysis = {
    summary: candidateYears >= targetYears
      ? `Your cumulative track record (~${candidateYears} years) satisfies the requested target of ${targetYears}+ years.`
      : `The target role requests ${targetYears}+ years; your résumé demonstrates ~${candidateYears} years. Emphasize project complexity and accelerated leadership to balance the duration gap.`,
    candidateYears,
    targetYears,
    alignmentLevel: candidateYears >= targetYears ? 'Strong' : 'Moderate',
    highlightedStrengths: matchedTech.length > 0 ? matchedTech.slice(0, 5) : ['General software engineering experience'],
    potentialGaps: missingTech.length > 0 ? missingTech.slice(0, 5) : ['No critical technical gaps detected'],
  };

  return {
    overallScore: scoreResult.overallScore,
    tier: scoreResult.tier,
    badgeColor: scoreResult.badgeColor,
    categoryBreakdown: scoreResult.categoryBreakdown,
    formulaExplanation: scoreResult.formulaExplanation,
    matchedSkills: matchedTech.map((s) => ({ name: s, category: 'Technical', verifiedInResume: true })),
    missingSkills: missingTech.map((s) => ({ name: s, category: 'Technical', required: true })),
    matchedSoftSkills: matchedSoft.map((s) => ({ name: s, category: 'Domain / Soft' })),
    missingSoftSkills: missingSoft.map((s) => ({ name: s, category: 'Domain / Soft' })),
    experienceAnalysis,
    suggestions,
    engine: 'deterministic-nlp',
    privacyNotice: 'Analyzed locally with zero external data sharing. Personal identifiers were masked prior to scoring.',
    disclaimer: 'This evaluation is an algorithmic guide to optimize résumé articulation. SkillMatch AI never invents qualifications and does not guarantee interview offers or hiring outcomes.',
  };
}

/**
 * AI-Driven analysis via Gemini LLM with structured parsing
 */
async function analyzeWithGemini(resumeText, jobDescription, apiKey) {
  logger.info('Calling Google Gemini API for deep semantic resume analysis...');
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash or gemini-2.5-flash for speed and structured outputs
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2, // Low temperature for factual, grounded consistency
    },
  });

  const prompt = `
You are an expert technical talent assessor and career strategist.
Analyze the provided candidate résumé against the target job description.

RÉSUMÉ (Personal Identifiers have been masked for privacy):
"""
${resumeText.slice(0, 10000)}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescription.slice(0, 8000)}
"""

INSTRUCTIONS & ETHICAL GUARDRAILS:
1. Grounding: All matched skills and experience comparisons MUST be grounded strictly in the provided résumé text. Do NOT hallucinate skills or work experience the candidate never mentioned.
2. Honest Advice: If the candidate lacks a skill, suggest truthful ways to address it (e.g. self-study, side projects, clarifying adjacent experience), NEVER advise inventing credentials.
3. Hiring Disclaimer: Never promise or guarantee interviews or job offers.
4. Output Schema: You must return valid JSON matching this exact structure:
{
  "targetJobTitle": "Title extracted from JD",
  "candidateEstimatedYears": 4,
  "targetRequestedYears": 5,
  "matchedTechnicalSkills": ["skill1", "skill2"],
  "missingTechnicalSkills": ["skill3", "skill4"],
  "matchedSoftSkills": ["skillA"],
  "missingSoftSkills": ["skillB"],
  "educationMatches": true,
  "certificationsMatch": false,
  "experienceSummary": "Honest assessment of experience alignment...",
  "highlightedStrengths": ["specific strength 1", "specific strength 2"],
  "potentialGaps": ["gap 1", "gap 2"],
  "actionableSuggestions": [
    {
      "category": "Impact / Skills / Framing",
      "action": "Concrete edit to make...",
      "rationale": "Why this aligns with the JD...",
      "priority": "High" | "Medium" | "Low"
    }
  ]
}
`;

  const response = await model.generateContent(prompt);
  const textOutput = response.response.text();
  const parsed = JSON.parse(textOutput);

  // Compute our transparent mathematical score from the extracted parameters
  const scoreResult = calculateTransparentScore({
    requiredTechSkills: [
      ...(parsed.matchedTechnicalSkills || []).map((n) => ({ name: n, importance: 'High' })),
      ...(parsed.missingTechnicalSkills || []).map((n) => ({ name: n, importance: 'High' })),
    ],
    matchedTechSkills: parsed.matchedTechnicalSkills || [],
    missingTechSkills: parsed.missingTechnicalSkills || [],
    candidateYears: parsed.candidateEstimatedYears || 0,
    targetYears: parsed.targetRequestedYears || 0,
    matchedSoftSkills: parsed.matchedSoftSkills || [],
    missingSoftSkills: parsed.missingSoftSkills || [],
    educationMatches: parsed.educationMatches ?? true,
    certificationsMatch: parsed.certificationsMatch ?? false,
  });

  return {
    targetJobTitle: parsed.targetJobTitle || 'Target Position',
    overallScore: scoreResult.overallScore,
    tier: scoreResult.tier,
    badgeColor: scoreResult.badgeColor,
    categoryBreakdown: scoreResult.categoryBreakdown,
    formulaExplanation: scoreResult.formulaExplanation,
    matchedSkills: (parsed.matchedTechnicalSkills || []).map((s) => ({ name: s, category: 'Technical', verifiedInResume: true })),
    missingSkills: (parsed.missingTechnicalSkills || []).map((s) => ({ name: s, category: 'Technical', required: true })),
    matchedSoftSkills: (parsed.matchedSoftSkills || []).map((s) => ({ name: s, category: 'Domain / Soft' })),
    missingSoftSkills: (parsed.missingSoftSkills || []).map((s) => ({ name: s, category: 'Domain / Soft' })),
    experienceAnalysis: {
      summary: parsed.experienceSummary || 'Candidate background compared against role seniority.',
      candidateYears: parsed.candidateEstimatedYears || 0,
      targetYears: parsed.targetRequestedYears || 0,
      alignmentLevel: (parsed.candidateEstimatedYears || 0) >= (parsed.targetRequestedYears || 0) ? 'Strong' : 'Moderate',
      highlightedStrengths: parsed.highlightedStrengths || [],
      potentialGaps: parsed.potentialGaps || [],
    },
    suggestions: parsed.actionableSuggestions || [],
    engine: 'gemini-1.5-flash',
    privacyNotice: 'Processed securely via Google Gemini API. PII was masked beforehand; queries are not retained for model training.',
    disclaimer: 'This evaluation is an algorithmic guide to optimize résumé articulation. SkillMatch AI never invents qualifications and does not guarantee interview offers or hiring outcomes.',
  };
}

/**
 * Main analysis entrypoint
 */
async function performMatchAnalysis(resumeText, jobDescription) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      return await analyzeWithGemini(resumeText, jobDescription, apiKey.trim());
    } catch (err) {
      logger.warn(`Gemini API invocation failed (${err.message}). Seamlessly falling back to deterministic NLP analyzer.`);
      return analyzeWithDeterministicNLP(resumeText, jobDescription);
    }
  }

  // Default fallback when API key is not supplied
  return analyzeWithDeterministicNLP(resumeText, jobDescription);
}

module.exports = {
  performMatchAnalysis,
  analyzeWithDeterministicNLP,
  extractSkillsFromText,
  extractExperienceYears,
};
