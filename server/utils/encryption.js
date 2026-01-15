import crypto from 'crypto';

/**
 * Field-Level Encryption Service
 * Encrypts sensitive data before storing in database
 * Uses AES-256-GCM for authenticated encryption
 */

class EncryptionService {
  constructor() {
    // Get encryption key from environment or generate for development
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16;  // 128 bits
    this.saltLength = 64;
    this.tagLength = 16;
    this.tagPosition = this.saltLength + this.ivLength;
    this.encryptedPosition = this.tagPosition + this.tagLength;

    // Get encryption key from environment
    const keyString = process.env.ENCRYPTION_KEY;
    if (keyString) {
      this.key = Buffer.from(keyString, 'hex');
    } else {
      console.warn('⚠️  ENCRYPTION_KEY not set. Generating temporary key (NOT for production!)');
      this.key = crypto.randomBytes(this.keyLength);
    }
  }

  /**
   * Encrypt a string value
   * @param {string} text - Text to encrypt
   * @returns {string} - Encrypted text with salt, IV, and auth tag (hex encoded)
   */
  encrypt(text) {
    if (!text) return null;

    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);

      // Derive key from master key and salt
      const key = crypto.pbkdf2Sync(this.key, salt, 100000, this.keyLength, 'sha512');

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      // Encrypt
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Combine: salt + iv + tag + encrypted
      // This ensures each encryption is unique even for same plaintext
      const result = Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'hex')
      ]);

      return result.toString('hex');
    } catch (error) {
      console.error('Encryption error:', error.message);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt an encrypted string
   * @param {string} encryptedHex - Encrypted text (hex encoded)
   * @returns {string} - Decrypted text
   */
  decrypt(encryptedHex) {
    if (!encryptedHex) return null;

    try {
      // Convert from hex
      const encrypted = Buffer.from(encryptedHex, 'hex');

      // Extract components
      const salt = encrypted.slice(0, this.saltLength);
      const iv = encrypted.slice(this.saltLength, this.tagPosition);
      const tag = encrypted.slice(this.tagPosition, this.encryptedPosition);
      const ciphertext = encrypted.slice(this.encryptedPosition);

      // Derive key from master key and salt
      const key = crypto.pbkdf2Sync(this.key, salt, 100000, this.keyLength, 'sha512');

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);

      // Decrypt
      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error.message);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Encrypt an object's sensitive fields
   * @param {Object} obj - Object with sensitive fields
   * @param {string[]} fields - Array of field names to encrypt
   * @returns {Object} - Object with encrypted fields
   */
  encryptFields(obj, fields) {
    const encrypted = { ...obj };
    
    fields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(encrypted[field]);
      }
    });

    return encrypted;
  }

  /**
   * Decrypt an object's encrypted fields
   * @param {Object} obj - Object with encrypted fields
   * @param {string[]} fields - Array of field names to decrypt
   * @returns {Object} - Object with decrypted fields
   */
  decryptFields(obj, fields) {
    const decrypted = { ...obj };
    
    fields.forEach(field => {
      if (decrypted[field]) {
        try {
          decrypted[field] = this.decrypt(decrypted[field]);
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error.message);
          decrypted[field] = null;
        }
      }
    });

    return decrypted;
  }

  /**
   * Hash sensitive data (one-way)
   * Use for data that needs to be compared but not retrieved
   * @param {string} text - Text to hash
   * @returns {string} - Hashed text (hex encoded)
   */
  hash(text) {
    if (!text) return null;

    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(text, salt, 100000, 64, 'sha512');
    
    return salt.toString('hex') + ':' + hash.toString('hex');
  }

  /**
   * Verify hashed data
   * @param {string} text - Text to verify
   * @param {string} hashedText - Previously hashed text
   * @returns {boolean}
   */
  verifyHash(text, hashedText) {
    if (!text || !hashedText) return false;

    try {
      const [saltHex, originalHash] = hashedText.split(':');
      const salt = Buffer.from(saltHex, 'hex');
      const hash = crypto.pbkdf2Sync(text, salt, 100000, 64, 'sha512');
      
      return hash.toString('hex') === originalHash;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a secure encryption key (for setup)
   * @returns {string} - Hex encoded key
   */
  static generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Export singleton instance
const encryptionService = new EncryptionService();
export default encryptionService;
