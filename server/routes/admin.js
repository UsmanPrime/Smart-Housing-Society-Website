import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import sendEmail from '../utils/sendEmail.js';
import { accountApprovedTemplate, accountRejectedTemplate } from '../utils/emailTemplates.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

// Get all pending users
router.get('/pending-users', auth, requireAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users: pendingUsers
    });
  } catch (err) {
    console.error('Error fetching pending users:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users by role (residents or vendors)
router.get('/users/:role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['resident', 'vendor'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Use resident or vendor.' });
    }

    const users = await User.find({ role })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (err) {
    console.error(`Error fetching ${req.params.role}s:`, err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Approve a user
router.put('/approve/:userId', auth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `User is already ${user.status}` 
      });
    }

    user.status = 'approved';
    await user.save();

    // Notify user (best-effort)
    try {
      const { subject, html } = accountApprovedTemplate({ name: user.name });
      await sendEmail({ to: user.email, subject, html });
    } catch (e) {
      console.warn('Approval email failed:', e?.message || e);
    }

    res.json({
      success: true,
      message: 'User approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject a user
router.put('/reject/:userId', auth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `User is already ${user.status}` 
      });
    }

    user.status = 'rejected';
    await user.save();

    // Notify user (best-effort)
    try {
      const { subject, html } = accountRejectedTemplate({ name: user.name });
      await sendEmail({ to: user.email, subject, html });
    } catch (e) {
      console.warn('Rejection email failed:', e?.message || e);
    }

    res.json({
      success: true,
      message: 'User rejected successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Error rejecting user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
