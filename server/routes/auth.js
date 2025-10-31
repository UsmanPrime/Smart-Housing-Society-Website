import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
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

    const { name, email, password, phone, role = 'resident' } = req.body;

    try {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email: email.toLowerCase(), passwordHash, phone, role });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
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
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
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

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const payload = { id: user._id, email: user.email, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });

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

export default router;
