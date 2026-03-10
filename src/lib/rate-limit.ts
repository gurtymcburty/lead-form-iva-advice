// Simple in-memory rate limiter
// For production with multiple instances, use Redis or similar

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, maxRequests: 5 }
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    const cutoff = now - config.interval;
    const entries = Array.from(rateLimitMap.entries());
    for (const [key, value] of entries) {
      if (value.resetTime < cutoff) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || entry.resetTime < now) {
    // New entry or expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.interval,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

export function getClientIP(request: Request): string {
  // Check common headers for client IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}
