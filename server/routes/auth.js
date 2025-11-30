import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { registrationPendingTemplate, resetOtpTemplate } from '../utils/emailTemplates.js';
import { logAction } from '../utils/auditLogger.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().isString(),
    body('role').optional().isIn(['resident', 'vendor', 'admin'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

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
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('totp').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Check if user account is approved
      // If status is undefined (old users), treat as pending and require approval
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
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // If admin has 2FA enabled, require TOTP verification
      if (user.role === 'admin' && user.twoFAEnabled) {
        const { totp } = req.body;
        if (!totp) {
          return res.status(401).json({ success: false, message: 'Two-factor code required', require2FA: true });
        }
        const verified = speakeasy.totp.verify({
          secret: user.twoFASecret,
          encoding: 'base32',
          token: totp,
          window: 1,
        });
        if (!verified) {
          return res.status(401).json({ success: false, message: 'Invalid two-factor code' });
        }
      }

      const payload = { id: user._id, email: user.email, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });

      // Log successful login
      await logAction('USER_LOGIN', user._id, user.name, user.role, {
        userId: user._id,
        resourceType: 'user',
        resourceId: user._id.toString(),
        details: { email: user.email },
        ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
      });

      return res.json({
        success: true,
        message: 'Login successful',
        token,
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
      await logAction('PASSWORD_RESET', user._id, user.name, user.role, {
        userId: user._id,
        resourceType: 'user',
        resourceId: user._id.toString(),
        details: { email: user.email },
        ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
      });

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

export default router;
