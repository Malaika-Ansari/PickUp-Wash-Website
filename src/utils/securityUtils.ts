/**
 * PICKUP WASH - APPLICATION SECURITY UTILITIES
 * Location: Kasur City, Pakistan
 *
 * Provides defensive security primitives:
 * 1. Input sanitization (XSS mitigation, control char stripping, length bounds)
 * 2. Pakistani phone & email normalization
 * 3. Reference ID sanitization (alphanumeric whitelisting)
 * 4. PII masking for safe logging
 * 5. Database error masking (preventing SQL/schema disclosure)
 * 6. Client-side abuse prevention & rate limiting
 */

// -------------------------------------------------------------
// 1. INPUT SANITIZATION PRIMITIVES
// -------------------------------------------------------------

/**
 * Strips HTML tags, script markers, and dangerous characters from user input.
 * Prevents stored and reflected Cross-Site Scripting (XSS).
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '') // Strip remaining HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Strip inline event handlers like onclick=
    .trim();
}

/**
 * General text sanitizer with character length enforcement and control character stripping.
 */
export function sanitizeText(input: string | undefined | null, maxLength: number = 250): string {
  if (!input || typeof input !== 'string') return '';
  const stripped = sanitizeHtml(input)
    // Strip non-printable ASCII control characters (0x00-0x1F, 0x7F) except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
  return stripped.slice(0, maxLength);
}

/**
 * Normalizes and validates Pakistani mobile phone numbers.
 * Supports: 03001234567, 0300-1234567, +923001234567, 923001234567
 * Returns clean 11-digit format starting with 03 (e.g. 03001234567)
 */
export function sanitizePhone(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  const digits = input.replace(/[^0-9]/g, '');

  if (digits.startsWith('923') && digits.length === 12) {
    return '0' + digits.slice(2);
  }
  if (digits.startsWith('03') && digits.length === 11) {
    return digits;
  }
  if (digits.startsWith('3') && digits.length === 10) {
    return '0' + digits;
  }
  return digits.slice(0, 15);
}

/**
 * Sanitizes and validates email addresses.
 * Converts to lowercase, trims whitespace, validates RFC format.
 */
export function sanitizeEmail(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  const clean = input.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(clean) ? clean : '';
}

/**
 * Sanitizes booking reference and transaction reference codes.
 * Whitelists uppercase alphanumeric characters, hyphens, and underscores.
 */
export function sanitizeReference(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[^a-zA-Z0-9\-_]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, 40);
}

// -------------------------------------------------------------
// 2. PII MASKING UTILITIES
// -------------------------------------------------------------

/**
 * Masks sensitive customer PII for display in audit summaries and sanitized logs.
 */
export function maskSensitiveData(value: string | undefined | null, type: 'phone' | 'email' | 'token'): string {
  if (!value || typeof value !== 'string') return '';

  if (type === 'phone') {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length >= 7) {
      const prefix = digits.slice(0, 4);
      const suffix = digits.slice(-3);
      return `${prefix}****${suffix}`;
    }
    return '0300****000';
  }

  if (type === 'email') {
    const parts = value.split('@');
    if (parts.length === 2) {
      const name = parts[0];
      const domain = parts[1];
      const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
      return `${maskedName}@${domain}`;
    }
    return 'u***@***.***';
  }

  if (type === 'token') {
    return value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : '****';
  }

  return '***';
}

// -------------------------------------------------------------
// 3. DATABASE ERROR MASKING (INFORMATION DISCLOSURE MITIGATION)
// -------------------------------------------------------------

/**
 * Maps raw database error codes and internal messages to user-friendly, safe messages.
 * Prevents leaking PostgreSQL table structures, constraint names, or internal stack traces.
 */
export function sanitizeDatabaseError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const rawMessage = typeof error === 'string' ? error : error.message || '';
  const code = error.code || '';

  // 1. Specific security exception messages from our database triggers
  if (rawMessage.includes('Privilege Escalation Blocked')) {
    return 'Security Error: You do not have permission to modify account administrative roles.';
  }
  if (rawMessage.includes('Unauthorized Payment Mutation')) {
    return 'Security Error: Payment amounts and verification status can only be updated by authorized administrators.';
  }
  if (rawMessage.includes('Cancellation Prohibited')) {
    return 'Notice: This order cannot be cancelled automatically because collection or processing has already started. Please contact support.';
  }
  if (rawMessage.includes('Unauthorized Booking Status Change')) {
    return 'Security Error: You do not have permission to modify booking lifecycle stages directly.';
  }
  if (rawMessage.includes('Notification Tampering Blocked')) {
    return 'Security Error: You cannot alter notification content.';
  }

  // 2. PostgreSQL Error Codes
  switch (code) {
    case '23505': // Unique violation (e.g. duplicate email or booking reference)
      if (rawMessage.includes('profiles_email') || rawMessage.includes('email')) {
        return 'An account with this email address already exists. Please sign in instead.';
      }
      return 'A record with these details already exists. Please verify your information.';

    case '42501': // Insufficient privilege / RLS violation
      return 'Access Denied: You do not have permission to perform this action.';

    case '23503': // Foreign key violation
      return 'Unable to link record: Associated booking or account was not found.';

    case '22P02': // Invalid text representation (e.g. bad UUID)
      return 'The requested record identifier is invalid.';

    case '42P01': // Undefined table
      return 'Database service is temporarily unavailable. Please try again in a few moments.';

    default:
      break;
  }

  // 3. Generic fallback without exposing internal PostgreSQL names
  if (rawMessage.includes('duplicate key')) {
    return 'A duplicate entry was detected. Please check your details.';
  }
  if (rawMessage.includes('violates foreign key')) {
    return 'Referenced record was not found in the database.';
  }
  if (rawMessage.includes('permission denied') || rawMessage.includes('row-level security')) {
    return 'Access Denied: You do not have sufficient permissions for this operation.';
  }
  if (rawMessage.includes('Network') || rawMessage.includes('Failed to fetch')) {
    return 'Network connectivity issue. Please check your internet connection.';
  }

  // If already clean and short, return safely, otherwise return generic notice
  if (rawMessage.length > 0 && rawMessage.length < 120 && !rawMessage.includes('postgres') && !rawMessage.includes('public.')) {
    return rawMessage;
  }

  return 'The operation could not be completed. Please check your input and try again.';
}

// -------------------------------------------------------------
// 4. CLIENT-SIDE ABUSE PREVENTION & RATE LIMITING
// -------------------------------------------------------------

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
}

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowMs: 5 * 60 * 1000, lockoutMs: 60 * 1000 }, // 5 fails -> 1 min lockout
  admin_login: { maxAttempts: 4, windowMs: 10 * 60 * 1000, lockoutMs: 2 * 60 * 1000 }, // 4 fails -> 2 min lockout
  password_reset: { maxAttempts: 3, windowMs: 15 * 60 * 1000, lockoutMs: 5 * 60 * 1000 }, // 3 requests -> 5 min lockout
  booking_submit: { maxAttempts: 3, windowMs: 30 * 1000, lockoutMs: 10 * 1000 }, // 3 submissions / 30s
  tid_submit: { maxAttempts: 5, windowMs: 10 * 60 * 1000, lockoutMs: 2 * 60 * 1000 },
};

class SecurityRateLimiterManager {
  private records: Map<string, AttemptRecord> = new Map();

  private getKey(action: string, identifier?: string): string {
    const cleanId = identifier ? sanitizeText(identifier.toLowerCase(), 50) : 'global';
    return `${action}:${cleanId}`;
  }

  /**
   * Checks whether the given action is permitted or currently rate-limited.
   */
  checkLimit(action: string, identifier?: string): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
    const config = DEFAULT_CONFIGS[action] || { maxAttempts: 10, windowMs: 60000, lockoutMs: 60000 };
    const key = this.getKey(action, identifier);
    const now = Date.now();
    const record = this.records.get(key);

    if (!record) {
      return { allowed: true, retryAfterSeconds: 0, remaining: config.maxAttempts };
    }

    // Check if locked out
    if (record.lockedUntil && now < record.lockedUntil) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, retryAfterSeconds, remaining: 0 };
    }

    // Reset window if window expired
    if (now - record.firstAttemptAt > config.windowMs) {
      this.records.delete(key);
      return { allowed: true, retryAfterSeconds: 0, remaining: config.maxAttempts };
    }

    const remaining = Math.max(0, config.maxAttempts - record.count);
    return {
      allowed: record.count < config.maxAttempts,
      retryAfterSeconds: 0,
      remaining,
    };
  }

  /**
   * Records a failed or completed attempt, applying a lockout if threshold is exceeded.
   */
  recordAttempt(action: string, identifier?: string): void {
    const config = DEFAULT_CONFIGS[action] || { maxAttempts: 10, windowMs: 60000, lockoutMs: 60000 };
    const key = this.getKey(action, identifier);
    const now = Date.now();
    const existing = this.records.get(key);

    if (!existing || now - existing.firstAttemptAt > config.windowMs) {
      this.records.set(key, {
        count: 1,
        firstAttemptAt: now,
        lockedUntil: null,
      });
      return;
    }

    existing.count += 1;
    if (existing.count >= config.maxAttempts) {
      existing.lockedUntil = now + config.lockoutMs;
    }
  }

  /**
   * Resets rate limiter record (e.g. upon successful authentication).
   */
  reset(action: string, identifier?: string): void {
    const key = this.getKey(action, identifier);
    this.records.delete(key);
  }
}

export const securityRateLimiter = new SecurityRateLimiterManager();

