import express from 'express';
import AuditLog from '../models/AuditLog.js';
import auth from '../middleware/auth.js';
import { getAuditLogs } from '../utils/auditLogger.js';
import { reportLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

// ============================================
// 1. GET /api/audit/logs - Get audit logs with filters (Admin Only)
// ============================================
router.get('/logs', auth, requireAdmin, async (req, res) => {
  try {
    const {
      from,
      to,
      userId,
      action,
      resourceType,
      search,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;

    // Date range filter
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // End of day
        query.createdAt.$lte = toDate;
      }
    }

    // Search in details (if provided)
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { resourceType: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: logs.length,
      total,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit logs'
    });
  }
});

// ============================================
// 2. GET /api/audit/export - Export logs as CSV (Admin Only)
// ============================================
router.get('/export', auth, requireAdmin, reportLimiter, async (req, res) => {
  try {
    const {
      from,
      to,
      userId,
      action,
      resourceType,
      search
    } = req.query;

    // Build query (same as logs endpoint)
    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;

    // Date range filter
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    // Search filter
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { resourceType: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch all matching logs (no pagination for export)
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(10000) // Limit to prevent memory issues
      .lean();

    // Generate CSV
    const csvHeaders = [
      'Timestamp',
      'User Name',
      'User Role',
      'Action',
      'Resource Type',
      'Resource ID',
      'Details',
      'IP Address'
    ];

    const csvRows = logs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.userName,
      log.userRole,
      log.action,
      log.resourceType,
      log.resourceId || '',
      JSON.stringify(log.details || {}),
      log.ipAddress || ''
    ]);

    // Build CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(field => {
          // Escape fields containing commas or quotes
          const fieldStr = String(field);
          if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
            return `"${fieldStr.replace(/"/g, '""')}"`;
          }
          return fieldStr;
        }).join(',')
      )
    ].join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting audit logs'
    });
  }
});

// ============================================
// 3. GET /api/audit/actions - Get list of all action types (Admin Only)
// ============================================
router.get('/actions', auth, requireAdmin, async (req, res) => {
  try {
    const actions = await AuditLog.distinct('action');
    
    res.json({
      success: true,
      data: actions.sort()
    });
  } catch (error) {
    console.error('Error fetching action types:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching action types'
    });
  }
});

export default router;
