import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';

/**
 * Two-Factor Authentication Service
 * Provides TOTP (Time-based One-Time Password) functionality
 */

class TwoFactorAuthService {
  /**
   * Generate a new 2FA secret for a user
   * @param {string} email - User's email address
   * @param {string} appName - Application name (appears in authenticator app)
   * @returns {Promise<{secret: string, qrCode: string, backupCodes: string[]}>}
   */
  static async generateSecret(email, appName = 'Smart Housing Society') {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${appName} (${email})`,
      length: 32,
      issuer: appName
    });

    // Generate QR code for easy setup
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Generate backup codes (8 codes, 10 characters each)
    const backupCodes = Array.from({ length: 8 }, () => 
      crypto.randomBytes(5).toString('hex').toUpperCase()
    );

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes
    };
  }

  /**
   * Verify a TOTP token
   * @param {string} token - 6-digit token from authenticator app
   * @param {string} secret - User's 2FA secret
   * @param {number} window - Time window for verification (default: 1 = ±30 seconds)
   * @returns {boolean}
   */
  static verifyToken(token, secret, window = 1) {
    if (!token || !secret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''), // Remove any spaces
      window
    });
  }

  /**
   * Generate backup codes for 2FA recovery
   * @param {number} count - Number of backup codes to generate
   * @returns {string[]}
   */
  static generateBackupCodes(count = 8) {
    return Array.from({ length: count }, () => 
      crypto.randomBytes(5).toString('hex').toUpperCase()
    );
  }

  /**
   * Hash backup codes for secure storage
   * @param {string[]} codes - Array of backup codes
   * @returns {Promise<string[]>}
   */
  static async hashBackupCodes(codes) {
    const bcrypt = (await import('bcryptjs')).default;
    return Promise.all(
      codes.map(code => bcrypt.hash(code, 10))
    );
  }

  /**
   * Verify a backup code
   * @param {string} code - Backup code to verify
   * @param {string[]} hashedCodes - Array of hashed backup codes
   * @returns {Promise<{valid: boolean, index: number}>}
   */
  static async verifyBackupCode(code, hashedCodes) {
    const bcrypt = (await import('bcryptjs')).default;
    
    for (let i = 0; i < hashedCodes.length; i++) {
      const isValid = await bcrypt.compare(code, hashedCodes[i]);
      if (isValid) {
        return { valid: true, index: i };
      }
    }
    
    return { valid: false, index: -1 };
  }

  /**
   * Generate a QR code from a secret
   * @param {string} secret - Base32 encoded secret
   * @param {string} email - User's email
   * @param {string} appName - Application name
   * @returns {Promise<string>}
   */
  static async generateQRCode(secret, email, appName = 'Smart Housing Society') {
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: email,
      issuer: appName,
      encoding: 'base32'
    });

    return qrcode.toDataURL(otpauthUrl);
  }

  /**
   * Validate 2FA setup
   * @param {string} token - Token to verify
   * @param {string} secret - Secret to verify against
   * @returns {boolean}
   */
  static validateSetup(token, secret) {
    // Require exact match during setup (no time window)
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''),
      window: 0
    });
  }
}

export default TwoFactorAuthService;
