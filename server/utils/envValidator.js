/**
 * Environment Variable Validation
 * Ensures all required environment variables are set and valid
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT'
];

const optionalEnvVars = {
  'JWT_REFRESH_SECRET': 'Should be different from JWT_SECRET',
  'ENCRYPTION_KEY': 'Required for field-level encryption',
  'FRONTEND_URL': 'Required for CORS',
  'EMAIL_HOST': 'Required for email notifications',
  'EMAIL_USER': 'Required for email notifications',
  'EMAIL_PASS': 'Required for email notifications',
  'RECAPTCHA_SECRET_KEY': 'Required for reCAPTCHA verification',
  'SECURITY_EMAIL': 'Required for security alerts',
  'NODE_ENV': 'Should be "development" or "production"'
};

const productionRequiredVars = [
  'ENCRYPTION_KEY',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASS'
];

/**
 * Validate environment variables
 * @param {boolean} strict - If true, validate production requirements
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validateEnvironment(strict = false) {
  const errors = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Check optional variables
  Object.entries(optionalEnvVars).forEach(([varName, description]) => {
    if (!process.env[varName]) {
      warnings.push(`Missing optional environment variable: ${varName} - ${description}`);
    }
  });

  // Production-specific validation
  if (strict || process.env.NODE_ENV === 'production') {
    productionRequiredVars.forEach(varName => {
      if (!process.env[varName]) {
        errors.push(`Missing production-required variable: ${varName}`);
      }
    });

    // Validate NODE_ENV
    if (process.env.NODE_ENV !== 'production') {
      warnings.push('NODE_ENV should be set to "production" in production environment');
    }

    // Validate JWT secrets are different
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
      errors.push('JWT_SECRET and JWT_REFRESH_SECRET must be different');
    }

    // Validate encryption key length (should be 64 hex characters = 32 bytes)
    if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 64) {
      errors.push('ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes)');
    }

    // Validate HTTPS in production
    if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.startsWith('https://')) {
      errors.push('FRONTEND_URL must use HTTPS in production');
    }
  }

  // Validate URL formats
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    errors.push('MONGODB_URI must be a valid MongoDB connection string');
  }

  if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.startsWith('http')) {
    errors.push('FRONTEND_URL must be a valid HTTP(S) URL');
  }

  // Validate port number
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push('PORT must be a valid port number (1-65535)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate environment and exit if errors found
 * @param {boolean} strict - If true, validate production requirements
 */
export function validateEnvironmentOrExit(strict = false) {
  const { valid, errors, warnings } = validateEnvironment(strict);

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (!valid) {
    console.error('\n❌ Environment Validation Failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\nPlease set the required environment variables in your .env file\n');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
  
  if (warnings.length > 0) {
    console.log(`   ${warnings.length} warning(s) - review optional variables\n`);
  } else {
    console.log('   All required and optional variables configured\n');
  }
}

/**
 * Get environment summary
 * @returns {Object}
 */
export function getEnvironmentSummary() {
  const { valid, errors, warnings } = validateEnvironment();
  
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    valid,
    errorCount: errors.length,
    warningCount: warnings.length,
    configured: {
      database: !!process.env.MONGODB_URI,
      jwt: !!process.env.JWT_SECRET,
      encryption: !!process.env.ENCRYPTION_KEY,
      email: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER),
      recaptcha: !!process.env.RECAPTCHA_SECRET_KEY,
      frontend: !!process.env.FRONTEND_URL
    }
  };
}

/**
 * Generate example .env file content
 * @returns {string}
 */
export function generateEnvTemplate() {
  return `# Database
MONGODB_URI=mongodb://localhost:27017/smart-housing

# Server
PORT=5000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-different-refresh-secret-change-this-too

# Encryption (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=generate-a-64-character-hex-string-using-crypto

# Frontend
FRONTEND_URL=http://localhost:5173

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@smarthousing.com
SECURITY_EMAIL=security@smarthousing.com

# reCAPTCHA
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Optional: Redis (for production token storage)
# REDIS_URL=redis://localhost:6379

# Optional: File Storage
# MAX_FILE_SIZE=5242880
# ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
`;
}

export default {
  validateEnvironment,
  validateEnvironmentOrExit,
  getEnvironmentSummary,
  generateEnvTemplate
};
