import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Security-specific logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'security.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'security-errors.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  securityLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Security event types
export const SecurityEvents = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGIN_LOCKED: 'LOGIN_LOCKED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS: 'FORBIDDEN_ACCESS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  // Two-Factor Authentication events
  TWO_FA_SETUP_INITIATED: 'TWO_FA_SETUP_INITIATED',
  TWO_FA_SETUP_FAILED: 'TWO_FA_SETUP_FAILED',
  TWO_FA_ENABLED: 'TWO_FA_ENABLED',
  TWO_FA_DISABLED: 'TWO_FA_DISABLED',
  TWO_FA_VERIFICATION_SUCCESS: 'TWO_FA_VERIFICATION_SUCCESS',
  TWO_FA_VERIFICATION_FAILED: 'TWO_FA_VERIFICATION_FAILED',
  TWO_FA_BACKUP_CODE_USED: 'TWO_FA_BACKUP_CODE_USED',
  TWO_FA_BACKUP_CODES_REGENERATED: 'TWO_FA_BACKUP_CODES_REGENERATED',
  TOKEN_FINGERPRINT_MISMATCH: 'TOKEN_FINGERPRINT_MISMATCH',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  FILE_UPLOAD: 'FILE_UPLOAD',
  FILE_UPLOAD_REJECTED: 'FILE_UPLOAD_REJECTED',
  DATA_EXPORT: 'DATA_EXPORT',
  ROLE_CHANGE: 'ROLE_CHANGE',
  USER_DELETED: 'USER_DELETED',
  USER_REGISTERED: 'USER_REGISTERED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CSRF_VIOLATION: 'CSRF_VIOLATION',
  XSS_ATTEMPT: 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
  NOSQL_INJECTION_ATTEMPT: 'NOSQL_INJECTION_ATTEMPT',
  VIRUS_DETECTED: 'VIRUS_DETECTED'
};

// Log security event
export function logSecurityEvent(event, req, additionalData = {}) {
  const logData = {
    event,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    method: req.method,
    path: req.path,
    userId: req.user?.id || 'anonymous',
    userRole: req.user?.role || 'none',
    ...additionalData
  };
  
  const level = isHighSeverityEvent(event) ? 'error' : 'info';
  
  securityLogger[level](logData);
  
  // In production, you might want to send critical events to a monitoring service
  if (isHighSeverityEvent(event)) {
    alertSecurityTeam(logData);
  }
  
  return logData;
}

// Determine if event is high severity
function isHighSeverityEvent(event) {
  const highSeverity = [
    SecurityEvents.SUSPICIOUS_ACTIVITY,
    SecurityEvents.XSS_ATTEMPT,
    SecurityEvents.SQL_INJECTION_ATTEMPT,
    SecurityEvents.NOSQL_INJECTION_ATTEMPT,
    SecurityEvents.VIRUS_DETECTED,
    SecurityEvents.CSRF_VIOLATION,
    SecurityEvents.UNAUTHORIZED_ACCESS,
    SecurityEvents.TOKEN_FINGERPRINT_MISMATCH,
    SecurityEvents.LOGIN_LOCKED
  ];
  
  return highSeverity.includes(event);
}

// Alert security team (implement based on your needs)
function alertSecurityTeam(logData) {
  // TODO: Implement email/Slack/SMS alerts for critical security events
  // For now, just log to console with prominent warning
  console.error('\n🚨 ==================== SECURITY ALERT ====================');
  console.error('Event:', logData.event);
  console.error('IP:', logData.ip);
  console.error('User:', logData.userId);
  console.error('Details:', JSON.stringify(logData, null, 2));
  console.error('=========================================================\n');
}

// Export the logger instance for direct use if needed
export default securityLogger;
