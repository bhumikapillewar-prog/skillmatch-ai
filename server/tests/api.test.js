const request = require('supertest');
const app = require('../src/app');

describe('API Integration Test Suite', () => {
  let authToken = '';
  let createdAnalysisId = '';

  test('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('POST /api/auth/register creates a user and returns JWT token', async () => {
    const uniqueEmail = `tester_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Rivera',
        email: uniqueEmail,
        password: 'Password123!',
        headline: 'Full-Stack Developer',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.name).toBe('Alex Rivera');
    expect(res.body.data.user.password).toBeUndefined(); // Ensure password not leaked

    authToken = res.body.data.token;
  });

  test('GET /api/auth/me returns current user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Alex Rivera');
  });

  test('POST /api/analyses successfully analyzes pasted resume vs job description', async () => {
    const resumeText = `
      Alex Rivera - Full Stack Engineer
      Summary: 5+ years building distributed web applications.
      Skills: JavaScript, TypeScript, React, Node.js, Express, MongoDB, Docker, Git.
      Experience:
      Senior Software Engineer (2021 - Present)
      - Architected React and Node.js microservices reducing API latency by 35%.
      - Mentored junior engineers and led agile sprint planning.
      Software Developer (2019 - 2021)
      - Developed REST APIs and MongoDB data pipelines.
      Education: Bachelor of Science in Computer Science.
    `;

    const jobDescription = `
      We are looking for a Senior Full-Stack Engineer with 4+ years of experience.
      Requirements:
      - Strong proficiency in React, Node.js, Express, and MongoDB (MERN).
      - Hands-on experience with TypeScript, Docker, and AWS.
      - Strong communication and cross-functional collaboration skills.
      - Bachelor's degree in CS or equivalent practical experience.
    `;

    const res = await request(app)
      .post('/api/analyses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        jobTitle: 'Senior Full-Stack Engineer',
        jobCompany: 'CloudScale Tech',
        resumeText,
        jobDescription,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    const analysis = res.body.data.analysis;

    expect(analysis.overallScore).toBeGreaterThanOrEqual(70);
    expect(analysis.categoryBreakdown).toBeDefined();
    expect(analysis.categoryBreakdown.technicalSkills.score).toBeGreaterThan(0);
    expect(analysis.matchedSkills.length).toBeGreaterThan(0);
    expect(analysis.suggestions.length).toBeGreaterThan(0);
    expect(analysis.formulaExplanation).toBeDefined();

    createdAnalysisId = analysis._id;
  });

  test('GET /api/analyses returns the saved analysis list', async () => {
    const res = await request(app)
      .get('/api/analyses')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analyses.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/analyses/:id fetches specific analysis details', async () => {
    const res = await request(app)
      .get(`/api/analyses/${createdAnalysisId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analysis._id).toBe(createdAnalysisId);
  });

  test('DELETE /api/analyses/:id deletes the analysis record', async () => {
    const res = await request(app)
      .delete(`/api/analyses/${createdAnalysisId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is gone
    const verifyRes = await request(app)
      .get(`/api/analyses/${createdAnalysisId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(verifyRes.statusCode).toBe(404);
  });
});
