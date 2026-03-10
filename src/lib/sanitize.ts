// Input sanitization utilities

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limit length
    .slice(0, 1000);
}

export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email).toLowerCase();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : '';
}

export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters except + at the start
  let sanitized = sanitizeString(phone);
  const startsWithPlus = sanitized.startsWith('+');
  sanitized = sanitized.replace(/\D/g, '');
  if (startsWithPlus) {
    sanitized = '+' + sanitized;
  }
  return sanitized;
}

export function sanitizeName(name: string): string {
  return sanitizeString(name)
    // Remove numbers and special characters, keep spaces, hyphens, apostrophes
    .replace(/[^a-zA-Z\s\-']/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export interface SanitizedFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  debtAmount: string;
  debtCount: string;
  employment: string;
  consent: string;
}

export function sanitizeFormData(answers: Record<string, string>): SanitizedFormData {
  return {
    firstName: sanitizeName(answers.first_name || ''),
    lastName: sanitizeName(answers.last_name || ''),
    email: sanitizeEmail(answers.email || ''),
    phone: sanitizePhone(answers.phone || ''),
    debtAmount: sanitizeString(answers.debt_amount || ''),
    debtCount: sanitizeString(answers.debt_count || ''),
    employment: sanitizeString(answers.employment || ''),
    consent: sanitizeString(answers.consent || ''),
  };
}
