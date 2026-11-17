const { sanitizeResumeText } = require('../src/services/piiSanitizer');

describe('PII Sanitizer Test Suite', () => {
  test('strips SSN and phone numbers while keeping technical content intact', () => {
    const rawResume = `
      John Doe
      Email: john.doe@example.com
      Phone: (555) 123-4567 or 555-987-6543
      SSN: 123-45-6789
      Address: 742 Evergreen Terrace, Springfield
      
      Experienced Software Engineer with 6 years in React, Node.js, and MongoDB.
    `;

    const { sanitizedText, redactedItems } = sanitizeResumeText(rawResume);

    expect(sanitizedText).not.toContain('123-45-6789');
    expect(sanitizedText).not.toContain('(555) 123-4567');
    expect(sanitizedText).not.toContain('john.doe@example.com');
    expect(sanitizedText).toContain('[REDACTED_GOVT_ID]');
    expect(sanitizedText).toContain('[CANDIDATE_EMAIL]');
    expect(sanitizedText).toContain('[CANDIDATE_PHONE]');
    expect(sanitizedText).toContain('React, Node.js, and MongoDB');

    expect(redactedItems.emails).toBeGreaterThanOrEqual(1);
    expect(redactedItems.phones).toBeGreaterThanOrEqual(1);
  });

  test('handles empty or malformed input without error', () => {
    const result = sanitizeResumeText(null);
    expect(result.sanitizedText).toBe('');
    expect(result.redactedItems.emails).toBe(0);
  });
});
