import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter - More restrictive
 * 60 requests per minute per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/' || req.path === '/health';
  }
});

/**
 * Strict Authentication Rate Limiter
 * Only 5 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    message: 'Too many authentication attempts. Account temporarily locked for 15 minutes.',
    retryAfter: 900 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfter: 900,
      lockedUntil: new Date(Date.now() + 15 * 60 * 1000)
    });
  }
});

/**
 * File Upload Rate Limiter
 * 10 uploads per 15 minutes per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes
  message: {
    success: false,
    message: 'Too many file uploads from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Report/Export Rate Limiter (CPU intensive)
 * 5 reports per 15 minutes per IP
 */
export const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 reports per 15 minutes
  message: {
    success: false,
    message: 'Too many report requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Payment submission limiter
 * 3 payment submissions per minute
 */
export const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // Only 3 payment submissions per minute
  message: {
    success: false,
    message: 'Too many payment submissions. Please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// IP-based progressive delay for failed logins
const loginAttempts = new Map();

export const progressiveDelayMiddleware = (req, res, next) => {
  const ip = req.ip;
  const attempts = loginAttempts.get(ip) || 0;
  
  if (attempts > 0) {
    const delay = Math.min(1000 * Math.pow(2, attempts - 1), 30000); // Max 30 seconds
    setTimeout(() => next(), delay);
  } else {
    next();
  }
};

export const trackFailedLogin = (ip) => {
  const attempts = (loginAttempts.get(ip) || 0) + 1;
  loginAttempts.set(ip, attempts);
  
  // Reset after 1 hour
  setTimeout(() => loginAttempts.delete(ip), 60 * 60 * 1000);
};

export const clearFailedLogin = (ip) => {
  loginAttempts.delete(ip);
};
