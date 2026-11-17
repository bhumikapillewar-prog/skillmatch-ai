const { calculateTransparentScore } = require('../src/services/scoringEngine');

describe('Scoring Engine Test Suite', () => {
  test('computes strong alignment score for near-perfect profile', () => {
    const result = calculateTransparentScore({
      matchedTechSkills: ['react', 'node.js', 'typescript', 'mongodb', 'docker'],
      missingTechSkills: [],
      candidateYears: 5,
      targetYears: 4,
      matchedSoftSkills: ['collaboration', 'problem solving'],
      missingSoftSkills: [],
      educationMatches: true,
      certificationsMatch: true,
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(90);
    expect(result.tier).toBe('Strong Alignment');
    expect(result.categoryBreakdown.technicalSkills.score).toBe(40); // 100% of 40 pts
    expect(result.categoryBreakdown.experienceDepth.score).toBe(30); // 100% of 30 pts
    expect(result.formulaExplanation).toContain('40% weight');
  });

  test('handles zero candidate years gracefully with partial prorated score', () => {
    const result = calculateTransparentScore({
      matchedTechSkills: ['javascript', 'html5'],
      missingTechSkills: ['react', 'node.js', 'aws'],
      candidateYears: 0,
      targetYears: 3,
      matchedSoftSkills: ['communication'],
      missingSoftSkills: ['leadership'],
      educationMatches: true,
      certificationsMatch: false,
    });

    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThan(70);
    expect(result.categoryBreakdown.experienceDepth.candidateYears).toBe(0);
  });

  test('penalizes severe technical skill gaps proportionally', () => {
    const result = calculateTransparentScore({
      matchedTechSkills: [],
      missingTechSkills: ['python', 'pytorch', 'tensorflow', 'cuda'],
      candidateYears: 2,
      targetYears: 5,
      matchedSoftSkills: [],
      missingSoftSkills: ['research'],
      educationMatches: false,
      certificationsMatch: false,
    });

    expect(result.categoryBreakdown.technicalSkills.score).toBe(0);
    expect(result.overallScore).toBeLessThan(50);
    expect(result.tier).toBe('Low Alignment (Significant Retooling Needed)');
  });
});
