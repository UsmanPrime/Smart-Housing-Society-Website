import express from 'express';
import TwoFactorAuthService from '../utils/twoFactorAuth.js';
import encryptionService from '../utils/encryption.js';
import { logSecurityEvent, SecurityEvents } from '../utils/securityLogger.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/2fa/setup
 * @desc    Initialize 2FA setup for a user
 * @access  Private (authenticated users)
 */
router.post('/setup', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user (with 2FA fields)
    const user = await User.findById(userId).select('+twoFASecret');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.twoFAEnabled) {
      return res.status(400).json({ 
        success: false, 
        message: '2FA is already enabled. Disable it first to setup again.' 
      });
    }

    // Generate 2FA secret and QR code
    const { secret, qrCode, backupCodes } = await TwoFactorAuthService.generateSecret(
      user.email,
      'Smart Housing Society'
    );

    // Encrypt the secret before storing
    const encryptedSecret = encryptionService.encrypt(secret);

    // Hash backup codes before storing
    const hashedBackupCodes = await TwoFactorAuthService.hashBackupCodes(backupCodes);

    // Store encrypted secret and hashed backup codes (but don't enable yet)
    user.twoFASecret = encryptedSecret;
    user.backupCodes = hashedBackupCodes;
    user.twoFAVerified = false;
    await user.save();

    // Log setup initiation
    securityLogger.logSecurityEvent({
      type: SecurityEvents.TWO_FA_SETUP_INITIATED,
      userId: user._id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { role: user.role }
    });

    res.json({
      success: true,
      message: '2FA setup initiated. Scan QR code with your authenticator app.',
      data: {
        qrCode,
        secret, // Send unencrypted secret for QR code setup
        backupCodes // Send backup codes ONCE (user must save them)
      }
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    securityLogger.logSecurityEvent({
      type: SecurityEvents.TWO_FA_SETUP_FAILED,
      userId: req.user?.userId,
      ip: req.ip,
      metadata: { error: error.message }
    });
    res.status(500).json({ success: false, message: 'Failed to setup 2FA' });
  }
});

/**
 * @route   POST /api/2fa/verify-setup
 * @desc    Verify and enable 2FA with a token
 * @access  Private
 */
router.post('/verify-setup', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.userId;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    // Get user with secret
    const user = await User.findById(userId).select('+twoFASecret');
    
    if (!user || !user.twoFASecret) {
      return res.status(400).json({ 
        success: false, 
        message: 'No 2FA setup found. Please initiate setup first.' 
      });
    }

    // Decrypt secret
    const secret = encryptionService.decrypt(user.twoFASecret);

    // Verify token (strict verification during setup)
    const isValid = TwoFactorAuthService.validateSetup(token, secret);

    if (!isValid) {
      securityLogger.logSecurityEvent({
        type: SecurityEvents.TWO_FA_VERIFICATION_FAILED,
        userId: user._id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(400).json({ 
        success: false, 
        message: 'Invalid token. Please try again.' 
      });
    }

    // Enable 2FA
    user.twoFAEnabled = true;
    user.twoFAVerified = true;
    await user.save();

    securityLogger.logSecurityEvent({
      type: SecurityEvents.TWO_FA_ENABLED,
      userId: user._id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: '2FA has been successfully enabled for your account'
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify 2FA setup' });
  }
});

/**
 * @route   POST /api/2fa/verify
 * @desc    Verify 2FA token during login
 * @access  Public (called during login process)
 */
router.post('/verify', async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and token are required' 
      });
    }

    // Get user with secret
    const user = await User.findById(userId).select('+twoFASecret +backupCodes');
    
    if (!user || !user.twoFAEnabled) {
      return res.status(400).json({ 
        success: false, 
        message: '2FA is not enabled for this account' 
      });
    }

    // Decrypt secret
    const secret = encryptionService.decrypt(user.twoFASecret);

    // Try to verify as TOTP token first
    let isValid = TwoFactorAuthService.verifyToken(token, secret);
    let usedBackupCode = false;

    // If TOTP fails, try backup codes
    if (!isValid && user.backupCodes && user.backupCodes.length > 0) {
      const backupResult = await TwoFactorAuthService.verifyBackupCode(token, user.backupCodes);
      
      if (backupResult.valid) {
        isValid = true;
        usedBackupCode = true;

        // Remove used backup code
        user.backupCodes.splice(backupResult.index, 1);
        await user.save();

        securityLogger.logSecurityEvent({
          type: SecurityEvents.TWO_FA_BACKUP_CODE_USED,
          userId: user._id,
          email: user.email,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          metadata: { remainingCodes: user.backupCodes.length }
        });
      }
    }

    if (!isValid) {
      securityLogger.logSecurityEvent({
        type: SecurityEvents.TWO_FA_VERIFICATION_FAILED,
        userId: user._id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(400).json({ 
        success: false, 
        message: 'Invalid 2FA token or backup code' 
      });
    }

    // Log successful verification
    securityLogger.logSecurityEvent({
      type: SecurityEvents.TWO_FA_VERIFICATION_SUCCESS,
      userId: user._id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { usedBackupCode }
    });

    res.json({
      success: true,
      message: '2FA verification successful',
      data: {
        usedBackupCode,
        remainingBackupCodes: user.backupCodes ? user.backupCodes.length : 0
      }
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify 2FA' });
  }
});

/**
 * @route   POST /api/2fa/disable
 * @desc    Disable 2FA for user
 * @access  Private
 */
router.post('/disable', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required to disable 2FA' 
      });
    }

    // Get user
    const user = await User.findById(userId).select('+twoFASecret +backupCodes');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify password
    const bcrypt = (await import('bcryptjs')).default;
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Disable 2FA
    user.twoFAEnabled = false;
    user.twoFAVerified = false;
    user.twoFASecret = undefined;
    user.backupCodes = undefined;
    await user.save();

    securityLogger.logSecurityEvent({
      type: SecurityEvents.TWO_FA_DISABLED,
      userId: user._id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: '2FA has been disabled for your account'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
  }
});

/**
 * @route   POST /api/2fa/regenerate-backup-codes
 * @desc    Generate new backup codes
 * @access  Private
 */
router.post('/regenerate-backup-codes', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required to regenerate backup codes' 
      });
    }

    // Get user
    const user = await User.findById(userId).select('+backupCodes');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.twoFAEnabled) {
      return res.status(400).json({ 
        success: false, 
        message: '2FA is not enabled' 
      });
    }

    // Verify password
    const bcrypt = (await import('bcryptjs')).default;
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Generate new backup codes
    const backupCodes = TwoFactorAuthService.generateBackupCodes(8);
    const hashedBackupCodes = await TwoFactorAuthService.hashBackupCodes(backupCodes);

    // Update user
    user.backupCodes = hashedBackupCodes;
    await user.save();

    securityLogger.logSecurityEvent({
      type: SecurityEvents.TWO_FA_BACKUP_CODES_REGENERATED,
      userId: user._id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'New backup codes generated successfully',
      data: {
        backupCodes // Send ONCE - user must save them
      }
    });

  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(500).json({ success: false, message: 'Failed to regenerate backup codes' });
  }
});

/**
 * @route   GET /api/2fa/status
 * @desc    Get 2FA status for current user
 * @access  Private
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('+backupCodes');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        twoFAEnabled: user.twoFAEnabled || false,
        twoFAVerified: user.twoFAVerified || false,
        backupCodesCount: user.backupCodes ? user.backupCodes.length : 0
      }
    });

  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get 2FA status' });
  }
});

export default router;
