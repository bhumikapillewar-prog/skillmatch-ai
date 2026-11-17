const {
  extractSkillsFromText,
  extractExperienceYears,
  analyzeWithDeterministicNLP,
} = require('../src/services/aiService');

describe('AI Service Deterministic NLP Test Suite', () => {
  test('extracts technical skills and soft skills accurately', () => {
    const sample = `
      Full Stack Software Engineer with deep skills in React, TypeScript, Node.js, and MongoDB.
      Demonstrated ability in cross-functional collaboration and problem solving.
    `;

    const extracted = extractSkillsFromText(sample);
    expect(extracted.tech).toContain('react');
    expect(extracted.tech).toContain('typescript');
    expect(extracted.tech).toContain('node.js');
    expect(extracted.tech).toContain('mongodb');
    expect(extracted.soft).toContain('cross-functional collaboration');
    expect(extracted.soft).toContain('problem solving');
  });

  test('extracts experience years accurately from tenure expressions and year ranges', () => {
    const text1 = 'Senior Developer with 7+ years of experience in distributed systems.';
    expect(extractExperienceYears(text1)).toBe(7);

    const text2 = 'Software Engineer at Acme Corp (2018 - 2024)';
    expect(extractExperienceYears(text2)).toBeGreaterThanOrEqual(5);
  });

  test('analyzeWithDeterministicNLP returns complete match profile with transparent math and disclaimer', () => {
    const resume = `
      Alex Rivera
      Full Stack Engineer with 5+ years of experience in React, Node.js, Express, MongoDB, and Docker.
      Led cross-functional collaboration and solved critical latency issues.
      Bachelor of Science in Computer Science.
    `;

    const jd = `
      Looking for Full-Stack Engineer with 4+ years of experience.
      Must have React, Node.js, Express, MongoDB, TypeScript, and AWS.
      Strong problem solving and team collaboration skills.
    `;

    const result = analyzeWithDeterministicNLP(resume, jd);

    expect(result.overallScore).toBeGreaterThanOrEqual(60);
    expect(result.formulaExplanation).toBeDefined();
    expect(result.matchedSkills.map((s) => s.name)).toContain('react');
    expect(result.matchedSkills.map((s) => s.name)).toContain('node.js');
    expect(result.missingSkills.map((s) => s.name)).toContain('typescript');
    expect(result.missingSkills.map((s) => s.name)).toContain('aws');
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.disclaimer).toContain('never invents qualifications');
  });
});
