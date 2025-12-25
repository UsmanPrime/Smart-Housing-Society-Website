import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter
 * Protects all API endpoints from excessive requests
 * 100 requests per minute per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for successful requests (optional)
  skipSuccessfulRequests: false,
  // Skip rate limiting for failed requests (optional)
  skipFailedRequests: false,
});

/**
 * Authentication Rate Limiter
 * Limit for login, registration, and password reset
 * 100 requests per minute per IP
 */
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 login/register attempts per minute
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only count failed requests for auth
  skipSuccessfulRequests: false,
});

/**
 * File Upload Rate Limiter
 * Protects file upload endpoints from abuse
 * 100 uploads per minute per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 file uploads per minute
  message: {
    success: false,
    message: 'Too many file uploads from this IP, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Report/Export Rate Limiter
 * Protects resource-intensive operations
 * 100 requests per minute per IP
 */
export const reportLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 report requests per minute
  message: {
    success: false,
    message: 'Too many report requests from this IP, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
