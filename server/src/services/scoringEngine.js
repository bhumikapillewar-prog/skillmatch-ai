/**
 * Transparent Scoring Engine
 * Computes an explainable, weighted match score between candidate résumé and target job description.
 *
 * Scoring Breakdown:
 *  - Core Technical Skills: 40%
 *  - Experience Depth & Seniority: 30%
 *  - Domain & Soft Skills: 20%
 *  - Education & Certifications: 10%
 */

/**
 * Calculates match score and generates clear breakdown
 * @param {Object} params
 * @param {Array<{name: string, importance: string}>} params.requiredTechSkills
 * @param {Array<string>} params.matchedTechSkills
 * @param {Array<string>} params.missingTechSkills
 * @param {number} params.candidateYears
 * @param {number} params.targetYears
 * @param {Array<string>} params.matchedSoftSkills
 * @param {Array<string>} params.missingSoftSkills
 * @param {boolean} params.educationMatches
 * @param {boolean} params.certificationsMatch
 * @returns {Object} Full transparent scoring profile
 */
function calculateTransparentScore({
  requiredTechSkills = [],
  matchedTechSkills = [],
  missingTechSkills = [],
  candidateYears = 0,
  targetYears = 0,
  matchedSoftSkills = [],
  missingSoftSkills = [],
  educationMatches = true,
  certificationsMatch = false,
}) {
  // 1. Technical Skills Score (Weight: 40%)
  const totalTech = matchedTechSkills.length + missingTechSkills.length;
  let techRatio = totalTech > 0 ? (matchedTechSkills.length / totalTech) : 0.8;
  // Cap between 0 and 1
  techRatio = Math.max(0, Math.min(1, techRatio));
  const techScore = Math.round(techRatio * 40);

  // 2. Experience Depth Score (Weight: 30%)
  let expRatio = 1.0;
  if (targetYears > 0) {
    if (candidateYears >= targetYears) {
      expRatio = 1.0;
    } else {
      // Pro-rated experience with minimum floor if relevant projects exist
      expRatio = Math.max(0.3, candidateYears / targetYears);
    }
  } else {
    expRatio = candidateYears > 0 ? 0.9 : 0.7;
  }
  const expScore = Math.round(expRatio * 30);

  // 3. Domain & Soft Skills Score (Weight: 20%)
  const totalSoft = matchedSoftSkills.length + missingSoftSkills.length;
  let softRatio = totalSoft > 0 ? (matchedSoftSkills.length / totalSoft) : 0.75;
  softRatio = Math.max(0, Math.min(1, softRatio));
  const softScore = Math.round(softRatio * 20);

  // 4. Education & Certifications (Weight: 10%)
  let eduPoints = 0;
  if (educationMatches) eduPoints += 6;
  if (certificationsMatch) eduPoints += 4;
  else if (educationMatches && candidateYears >= 3) eduPoints += 2; // Industry experience compensator
  const eduScore = Math.min(10, Math.max(3, eduPoints));

  // Overall Total (0-100)
  const overallScore = Math.min(100, Math.max(0, techScore + expScore + softScore + eduScore));

  let tier = 'Moderate Alignment';
  let badgeColor = 'amber';
  if (overallScore >= 85) {
    tier = 'Strong Alignment';
    badgeColor = 'emerald';
  } else if (overallScore >= 70) {
    tier = 'Good Alignment';
    badgeColor = 'blue';
  } else if (overallScore >= 50) {
    tier = 'Partial Match (Key Gaps)';
    badgeColor = 'amber';
  } else {
    tier = 'Low Alignment (Significant Retooling Needed)';
    badgeColor = 'rose';
  }

  const categoryBreakdown = {
    technicalSkills: {
      label: 'Core Technical Competencies',
      weight: 40,
      score: techScore,
      percentage: Math.round((techScore / 40) * 100),
      matchedCount: matchedTechSkills.length,
      missingCount: missingTechSkills.length,
      explanation: totalTech > 0
        ? `Matched ${matchedTechSkills.length} of ${totalTech} identified technical requirements (${Math.round(techRatio * 100)}% coverage).`
        : 'Technical baseline adequately aligns with general job scope.',
    },
    experienceDepth: {
      label: 'Experience Depth & Seniority',
      weight: 30,
      score: expScore,
      percentage: Math.round((expScore / 30) * 100),
      candidateYears,
      targetYears,
      explanation: targetYears > 0
        ? `Target requests ${targetYears}+ years; résumé indicates ~${candidateYears} years of pertinent experience.`
        : `Candidate demonstrates approximately ${candidateYears} years of cumulative professional track record.`,
    },
    domainSoftSkills: {
      label: 'Domain Knowledge & Collaboration',
      weight: 20,
      score: softScore,
      percentage: Math.round((softScore / 20) * 100),
      matchedCount: matchedSoftSkills.length,
      missingCount: missingSoftSkills.length,
      explanation: `Demonstrated ${matchedSoftSkills.length} operational/soft skills needed for team workflow and stakeholder communication.`,
    },
    educationAndCerts: {
      label: 'Education & Certifications',
      weight: 10,
      score: eduScore,
      percentage: Math.round((eduScore / 10) * 100),
      explanation: educationMatches
        ? 'Formal degree / continuous education meets base criteria.'
        : 'Alternative practical experience evaluated against academic prerequisites.',
    },
  };

  const formulaExplanation = `Overall Score of ${overallScore}/100 is calculated via deterministic weighted multi-attribute evaluation: Technical Skills (40% weight: ${techScore}/40 pts) + Professional Experience (30% weight: ${expScore}/30 pts) + Domain & Soft Skills (20% weight: ${softScore}/20 pts) + Education & Certifications (10% weight: ${eduScore}/10 pts).`;

  return {
    overallScore,
    tier,
    badgeColor,
    categoryBreakdown,
    formulaExplanation,
  };
}

module.exports = {
  calculateTransparentScore,
};
