import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { registrationPendingTemplate, resetOtpTemplate } from '../utils/emailTemplates.js';
import { logAction } from '../utils/auditLogger.js';
import { authLimiter, progressiveDelayMiddleware, trackFailedLogin, clearFailedLogin } from '../middleware/rateLimiter.js';
import { loginValidation, registerValidation } from '../middleware/validation.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { verifyRecaptcha } from '../utils/recaptcha.js';
import { TokenService } from '../utils/tokenService.js';
import { logSecurityEvent, SecurityEvents } from '../utils/securityLogger.js';
import auth from '../middleware/auth.js';

const router = Router();

// Store for refresh tokens (in production, use Redis)
// Map structure: refreshToken -> { userId, createdAt, expiresAt }
const refreshTokenStore = new Map();

// Cleanup expired refresh tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of refreshTokenStore.entries()) {
    if (data.expiresAt < now) {
      refreshTokenStore.delete(token);
    }
  }
}, 60 * 60 * 1000);

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  registerValidation,
  async (req, res) => {
    const { name, email, password, phone, role = 'resident', specialization } = req.body;

    try {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      let userData = { name, email: email.toLowerCase(), passwordHash, phone, role };
      // Only allow specialization for vendors
      if (role === 'vendor' && Array.isArray(specialization)) {
        userData.specialization = specialization;
      }
      const user = await User.create(userData);

      // Log user registration
      await logAction({
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_REGISTERED',
        resourceType: 'user',
        resourceId: user._id.toString(),
        details: { email: user.email, role: user.role },
        req
      });

      // Send registration pending email (best-effort)
      try {
        const { subject, html } = registrationPendingTemplate({ name: user.name });
        await sendEmail({ to: user.email, subject, html });
      } catch (e) {
        console.warn('Registration email failed:', e?.message || e);
      }

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please wait for admin approval.',
        user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  progressiveDelayMiddleware,
  loginValidation,
  async (req, res) => {
    const { email, password, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: recaptchaResult.error || 'reCAPTCHA verification failed' 
        });
      }
    }

    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        trackFailedLogin(req.ip);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Check if account is locked
      if (user.isLocked) {
        const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
        return res.status(423).json({
          success: false,
          message: `Account locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`,
          lockedUntil: user.lockUntil
        });
      }

      // Check if user account is approved
      if (!user.status || user.status === 'pending') {
        return res.status(403).json({ 
          success: false, 
          message: 'Your account is pending approval. Please wait for admin verification.' 
        });
      }

      if (user.status === 'rejected') {
        return res.status(403).json({ 
          success: false, 
          message: 'Your account has been rejected. Please contact the administrator.' 
        });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        await user.incLoginAttempts();
        trackFailedLogin(req.ip);
        
        logSecurityEvent(SecurityEvents.LOGIN_FAILURE, req, {
          userId: user._id,
          email: user.email,
          reason: 'invalid_password',
          attemptsRemaining: Math.max(0, 5 - (user.loginAttempts + 1))
        });
        
        const attemptsRemaining = Math.max(0, 5 - (user.loginAttempts + 1));
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials',
          attemptsRemaining
        });
      }

      // Check if 2FA is enabled
      if (user.twoFAEnabled) {
        const { twoFactorToken } = req.body;
        
        if (!twoFactorToken) {
          // Password is valid but 2FA token required
          return res.status(200).json({ 
            success: false,
            require2FA: true,
            userId: user._id,
            message: 'Two-factor authentication required'
          });
        }

        // Verify 2FA token
        const TwoFactorAuthService = (await import('../utils/twoFactorAuth.js')).default;
        const encryptionService = (await import('../utils/encryption.js')).default;
        
        // Get user with 2FA secret
        const userWith2FA = await User.findById(user._id).select('+twoFASecret +backupCodes');
        const secret = encryptionService.decrypt(userWith2FA.twoFASecret);
        
        // Try TOTP verification
        let verified = TwoFactorAuthService.verifyToken(twoFactorToken, secret);
        let usedBackupCode = false;
        
        // If TOTP fails, try backup codes
        if (!verified && userWith2FA.backupCodes && userWith2FA.backupCodes.length > 0) {
          const backupResult = await TwoFactorAuthService.verifyBackupCode(
            twoFactorToken,
            userWith2FA.backupCodes
          );
          
          if (backupResult.valid) {
            verified = true;
            usedBackupCode = true;
            
            // Remove used backup code
            userWith2FA.backupCodes.splice(backupResult.index, 1);
            await userWith2FA.save();
            
            logSecurityEvent(SecurityEvents.TWO_FA_BACKUP_CODE_USED, req, {
              userId: user._id,
              email: user.email,
              remainingCodes: userWith2FA.backupCodes.length
            });
          }
        }
        
        if (!verified) {
          await user.incLoginAttempts();
          trackFailedLogin(req.ip);
          
          logSecurityEvent(SecurityEvents.TWO_FA_VERIFICATION_FAILED, req, {
            userId: user._id,
            email: user.email
          });
          
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid two-factor authentication code'
          });
        }
        
        logSecurityEvent(SecurityEvents.TWO_FA_VERIFICATION_SUCCESS, req, {
          userId: user._id,
          email: user.email,
          usedBackupCode
        });
      }

      // Successful login - reset login attempts
      await user.resetLoginAttempts();
      clearFailedLogin(req.ip);

      // Generate token pair with fingerprinting
      const { accessToken, refreshToken } = TokenService.generateTokenPair(user, req);
      
      // Store refresh token
      refreshTokenStore.set(refreshToken, {
        userId: user._id.toString(),
        createdAt: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // Log successful login
      logSecurityEvent(SecurityEvents.LOGIN_SUCCESS, req, {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });
      
      await logAction({
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: user._id.toString(),
        details: { email: user.email },
        req
      });

      return res.json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ----------------------
// Admin 2FA (TOTP)
// ----------------------

// POST /api/auth/2fa/setup - generate secret and QR
router.post('/2fa/setup', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin accounts can enable 2FA' });
    }
    const secret = speakeasy.generateSecret({ name: 'Smart Housing Society (Admin)' });
    const otpauth = secret.otpauth_url;
    const qrDataUrl = await qrcode.toDataURL(otpauth);
    // Store secret temporarily; will be finalized on enable
    user.twoFASecret = secret.base32;
    await user.save();
    return res.json({ success: true, secret: secret.base32, qr: qrDataUrl });
  } catch (err) {
    console.error('2FA setup error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/2fa/enable - verify TOTP and enable
router.post('/2fa/enable', authLimiter, async (req, res) => {
  try {
    const { email, totp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+twoFASecret');
    if (!user || user.role !== 'admin' || !user.twoFASecret) {
      return res.status(400).json({ success: false, message: '2FA not initialized' });
    }
    const ok = speakeasy.totp.verify({ secret: user.twoFASecret, encoding: 'base32', token: totp, window: 1 });
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Invalid two-factor code' });
    }
    user.twoFAEnabled = true;
    await user.save();
    return res.json({ success: true, message: 'Two-factor authentication enabled' });
  } catch (err) {
    console.error('2FA enable error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/2fa/disable - disable 2FA
router.post('/2fa/disable', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin accounts can disable 2FA' });
    }
    user.twoFAEnabled = false;
    user.twoFASecret = undefined;
    await user.save();
    return res.json({ success: true, message: 'Two-factor authentication disabled' });
  } catch (err) {
    console.error('2FA disable error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ----------------------
// Forgot/Reset Password
// ----------------------

// POST /api/auth/test-email (temporary - for debugging)
router.post('/test-email', async (req, res) => {
  try {
    const { to } = req.body;
    const testEmail = to || 'i242038@isb.nu.edu.pk';
    
    console.log('📧 Testing email to:', testEmail);
    const { subject, html } = resetOtpTemplate({ name: 'Test User', otp: '123456' });
    const result = await sendEmail({ to: testEmail, subject, html });
    
    console.log('📧 Email send result:', result);
    
    if (result.skipped) {
      return res.status(500).json({ 
        success: false, 
        message: 'Email not configured - EMAIL_USER or EMAIL_PASS missing' 
      });
    }
    
    if (result.success) {
      return res.json({ 
        success: true, 
        message: `Test email sent successfully to ${testEmail}`,
        info: result.info 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: result.error?.message || 'Unknown error'
    });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      // For security, respond with success even if user not found
      if (!user) {
        return res.json({ success: true, message: 'If an account exists, an OTP has been sent' });
      }

      // Generate 6-digit OTP
      const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
      const resetOtpHash = await bcrypt.hash(otp, 10);
      const resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.resetOtpHash = resetOtpHash;
      user.resetOtpExpires = resetOtpExpires;
      await user.save();

      // Send email (best-effort)
      try {
        const { subject, html } = resetOtpTemplate({ name: user.name, otp });
        const result = await sendEmail({ to: user.email, subject, html });
        
        if (result.skipped) {
          console.error('❌ OTP email NOT sent - EMAIL_USER/EMAIL_PASS not configured');
        } else if (result.success) {
          console.log('✅ OTP email sent successfully to:', user.email);
        } else {
          console.error('❌ OTP email failed:', result.error?.message || result.error);
        }
      } catch (e) {
        console.error('❌ Reset OTP email exception:', e?.message || e);
      }

      res.json({ success: true, message: 'If an account exists, an OTP has been sent' });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 4 }).withMessage('OTP is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, otp } = req.body;
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
      if (user.resetOtpExpires < new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
      const ok = await bcrypt.compare(otp, user.resetOtpHash);
      if (!ok) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
      return res.json({ success: true, message: 'OTP verified' });
    } catch (err) {
      console.error('Verify OTP error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 4 }).withMessage('OTP is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, otp, newPassword } = req.body;
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
      if (user.resetOtpExpires < new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
      const ok = await bcrypt.compare(otp, user.resetOtpHash);
      if (!ok) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      user.resetOtpHash = undefined;
      user.resetOtpExpires = undefined;
      await user.save();

      // Log password reset
      await logAction({
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        action: 'PASSWORD_RESET',
        resourceType: 'user',
        resourceId: user._id.toString(),
        details: { email: user.email },
        req
      });

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// POST /api/auth/refresh-token - Refresh access token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    // Check if token exists in store
    if (!refreshTokenStore.has(refreshToken)) {
      logSecurityEvent(SecurityEvents.INVALID_TOKEN, req, {
        reason: 'Refresh token not found in store'
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    try {
      // Verify refresh token
      const decoded = TokenService.verifyRefreshToken(refreshToken);
      
      // Get user
      const user = await User.findById(decoded.id);
      if (!user) {
        refreshTokenStore.delete(refreshToken);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Generate new access token
      const newAccessToken = TokenService.generateAccessToken(user, req);
      
      logSecurityEvent(SecurityEvents.LOGIN_SUCCESS, req, {
        userId: user._id.toString(),
        method: 'refresh_token'
      });
      
      return res.json({
        success: true,
        accessToken: newAccessToken
      });
    } catch (error) {
      // Invalid or expired refresh token
      refreshTokenStore.delete(refreshToken);
      logSecurityEvent(SecurityEvents.TOKEN_EXPIRED, req, {
        error: error.message
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// POST /api/auth/logout - Logout and invalidate refresh token
router.post('/logout', auth, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      refreshTokenStore.delete(refreshToken);
    }
    
    logSecurityEvent(SecurityEvents.LOGOUT, req, {
      userId: req.user.id
    });
    
    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
