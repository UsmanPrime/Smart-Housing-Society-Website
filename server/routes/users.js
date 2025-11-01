import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users/me - get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/me - update profile (name, phone, and optional password change)
router.put(
  '/me',
  auth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().isString(),
    body('currentPassword').optional().isString(),
    body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, phone, currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      // Update basic fields
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;

      // Handle password change if requested
      if (newPassword !== undefined || currentPassword !== undefined) {
        if (!currentPassword || !newPassword) {
          return res.status(400).json({ success: false, message: 'Both currentPassword and newPassword are required to change password' });
        }
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) {
          return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        user.passwordHash = await bcrypt.hash(newPassword, 10);
      }

      await user.save();
      const safeUser = await User.findById(user._id).select('-passwordHash');
      res.json({ success: true, message: 'Profile updated', user: safeUser });
    } catch (err) {
      console.error('Profile update error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

export default router;
