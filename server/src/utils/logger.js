/**
 * Privacy-Preserving Logger
 * Automatically sanitizes sensitive tokens, passwords, and PII patterns before output.
 */

const PII_PATTERNS = [
  { regex: /Bearer\s+([A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)/gi, mask: 'Bearer [REDACTED_JWT]' },
  { regex: /"password":\s*"[^"]+"/gi, mask: '"password": "[REDACTED]"' },
  { regex: /"token":\s*"[^"]+"/gi, mask: '"token": "[REDACTED]"' },
  { regex: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, mask: '[REDACTED_SSN]' },
  { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g, mask: '[REDACTED_EMAIL]' },
  { regex: /\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g, mask: '[REDACTED_PHONE]' },
];

function sanitize(message) {
  if (typeof message !== 'string') {
    try {
      message = JSON.stringify(message);
    } catch {
      message = String(message);
    }
  }
  let safe = message;
  for (const { regex, mask } of PII_PATTERNS) {
    safe = safe.replace(regex, mask);
  }
  return safe;
}

const logger = {
  info: (msg, ...args) => {
    const time = new Date().toISOString();
    console.log(`[${time}] [INFO] ${sanitize(msg)}`, ...args.map(sanitize));
  },
  warn: (msg, ...args) => {
    const time = new Date().toISOString();
    console.warn(`[${time}] [WARN] ${sanitize(msg)}`, ...args.map(sanitize));
  },
  error: (msg, ...args) => {
    const time = new Date().toISOString();
    console.error(`[${time}] [ERROR] ${sanitize(msg)}`, ...args.map(sanitize));
  },
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      const time = new Date().toISOString();
      console.log(`[${time}] [DEBUG] ${sanitize(msg)}`, ...args.map(sanitize));
    }
  },
};

module.exports = logger;
