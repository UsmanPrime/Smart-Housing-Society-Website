import express from 'express';
import { body, validationResult } from 'express-validator';
import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { announcementTemplate } from '../utils/emailTemplates.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Admin check middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

// GET /api/announcements - public list with optional pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page, limit, search, from, to } = req.query;

    // Build filter
    const filter = {};
    if (search && typeof search === 'string' && search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: rx }, { content: rx }];
    }

    // Date range filter on "date" field
    if (from || to) {
      filter.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) filter.date.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) filter.date.$lte = toDate;
      }
      // Remove empty object if both invalid
      if (Object.keys(filter.date).length === 0) delete filter.date;
    }

    const sort = { date: -1, createdAt: -1 };

    // If page is provided, paginate with default limit
    const pageNum = parseInt(page, 10) || 0;
    const limitNum = parseInt(limit, 10) || (pageNum > 0 ? 10 : 0);

    if (pageNum > 0) {
      const total = await Announcement.countDocuments(filter);
      const pages = Math.max(1, Math.ceil(total / Math.max(1, limitNum)));
      const current = Math.min(Math.max(1, pageNum), pages);
      const skip = (current - 1) * limitNum;

      const announcements = await Announcement.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email role')
        .exec();

      return res.json({
        success: true,
        announcements,
        pagination: { total, page: current, pages, limit: limitNum }
      });
    }

    // No pagination - keep existing behavior, support plain limit
    const q = Announcement.find(filter).sort(sort).populate('createdBy', 'name email role');
    if (limitNum > 0) q.limit(limitNum);
    const announcements = await q.exec();
    res.json({ success: true, announcements });
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/announcements - create (admin only)
router.post(
  '/',
  auth,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('date').optional().isISO8601().toDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { title, content, date } = req.body;
      const createdBy = req.user.id;
      const announcement = await Announcement.create({ title, content, date: date || Date.now(), createdBy });
      const populated = await announcement.populate('createdBy', 'name email role');

      // Best-effort: notify all approved users via BCC in chunks
      try {
        const users = await User.find({ status: 'approved' }).select('email').lean();
        const emails = users.map(u => u.email).filter(Boolean);
        const { subject, html } = announcementTemplate({ title, content, date: populated.date });

        const chunkSize = 50;
        for (let i = 0; i < emails.length; i += chunkSize) {
          const bcc = emails.slice(i, i + chunkSize);
          await sendEmail({ to: process.env.EMAIL_USER, bcc, subject, html });
        }
      } catch (e) {
        console.warn('Announcement email broadcast failed:', e?.message || e);
      }

      res.status(201).json({ success: true, message: 'Announcement created', announcement: populated });
    } catch (err) {
      console.error('Error creating announcement:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// PUT /api/announcements/:id - update (admin only)
router.put(
  '/:id',
  auth,
  requireAdmin,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    body('date').optional().isISO8601().toDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const update = {};
      const { title, content, date } = req.body;
      if (title !== undefined) update.title = title;
      if (content !== undefined) update.content = content;
      if (date !== undefined) update.date = date;

      const updated = await Announcement.findByIdAndUpdate(id, update, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Announcement not found' });
      const populated = await updated.populate('createdBy', 'name email role');
      res.json({ success: true, message: 'Announcement updated', announcement: populated });
    } catch (err) {
      console.error('Error updating announcement:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// DELETE /api/announcements/:id - delete (admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
