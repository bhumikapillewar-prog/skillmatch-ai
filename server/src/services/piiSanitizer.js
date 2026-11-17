/**
 * PII Sanitizer Service
 * Strips personally identifiable details (phone, SSN, home address) before
 * AI analysis to maximize user privacy, while retaining professional history and skills.
 */

const PII_REGEXES = {
  ssn: /\b\d{3}[-.\s]??\d{2}[-.\s]??\d{4}\b/g,
  phone: /(?:\+?1[-.\s]*)?(?:\([0-9]{3}\)|[0-9]{3})[-.\s]*[0-9]{3}[-.\s]*[0-9]{4}\b/g,
  streetAddress: /\b\d{1,5}\s+[A-Za-z0-9., ]{1,40}\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Court|Ct|Lane|Ln|Way)\b/gi,
  zipCode: /\b\d{5}(?:-\d{4})?\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
};

/**
 * Sanitizes resume text by replacing high-risk personal identifiers with privacy tokens.
 * @param {string} text - Raw extracted resume text
 * @returns {{ sanitizedText: string, redactedItems: { emails: number, phones: number, addresses: number } }}
 */
function sanitizeResumeText(text) {
  if (!text || typeof text !== 'string') {
    return { sanitizedText: '', redactedItems: { emails: 0, phones: 0, addresses: 0 } };
  }

  let sanitized = text;
  let emailsCount = 0;
  let phonesCount = 0;
  let addressesCount = 0;

  // Replace SSN
  sanitized = sanitized.replace(PII_REGEXES.ssn, () => '[REDACTED_GOVT_ID]');

  // Replace email with safe token
  sanitized = sanitized.replace(PII_REGEXES.email, () => {
    emailsCount++;
    return '[CANDIDATE_EMAIL]';
  });

  // Replace phone numbers
  sanitized = sanitized.replace(PII_REGEXES.phone, (match) => {
    // Avoid replacing 4 digit years like 2021 or simple numbered lists
    if (match.trim().length < 7) return match;
    phonesCount++;
    return '[CANDIDATE_PHONE]';
  });

  // Replace physical street addresses
  sanitized = sanitized.replace(PII_REGEXES.streetAddress, () => {
    addressesCount++;
    return '[CANDIDATE_LOCATION]';
  });

  return {
    sanitizedText: sanitized,
    redactedItems: {
      emails: emailsCount,
      phones: phonesCount,
      addresses: addressesCount,
    },
  };
}

module.exports = {
  sanitizeResumeText,
};
