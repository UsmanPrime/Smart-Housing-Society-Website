import jwt from 'jsonwebtoken';
import { TokenService } from '../utils/tokenService.js';
import { logSecurityEvent, SecurityEvents } from '../utils/securityLogger.js';

// Main authentication middleware with enhanced JWT security
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    logSecurityEvent(SecurityEvents.UNAUTHORIZED_ACCESS, req, {
      reason: 'No token provided'
    });
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Use TokenService for enhanced verification with fingerprinting
    const decoded = TokenService.verifyAccessToken(token, req);
    req.user = decoded;
    next();
  } catch (err) {
    // Log different types of token errors
    if (err.name === 'TokenExpiredError') {
      logSecurityEvent(SecurityEvents.TOKEN_EXPIRED, req, {
        expiredAt: err.expiredAt
      });
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (err.message.includes('fingerprint')) {
      logSecurityEvent(SecurityEvents.TOKEN_FINGERPRINT_MISMATCH, req, {
        reason: err.message
      });
      return res.status(401).json({ 
        success: false, 
        message: 'Token validation failed',
        code: 'INVALID_TOKEN'
      });
    } else {
      logSecurityEvent(SecurityEvents.INVALID_TOKEN, req, {
        error: err.message
      });
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
  }
}

// Default export for backward compatibility
export default authenticateToken;

// Middleware to check if user has required role(s)
export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}` 
      });
    }
    
    next();
  };
}

// Middleware to check if user is owner of resource or admin
export function requireOwnerOrAdmin(getUserIdFromResource) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const resourceUserId = typeof getUserIdFromResource === 'function' 
      ? getUserIdFromResource(req) 
      : req.params.userId || req.body.userId;
    
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access your own resources.' 
    });
  };
}

