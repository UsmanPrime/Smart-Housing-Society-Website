import express from 'express';
import Payment from '../models/Payment.js';
import ResidentDue from '../models/ResidentDue.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import auth from '../middleware/auth.js';
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
// 1. GET /api/reports/payment-summary - Aggregate payment data (Admin Only)
// ============================================
router.get('/payment-summary', auth, requireAdmin, reportLimiter, async (req, res) => {
  try {
    // Get payment statistics
    const [
      verifiedPayments,
      pendingPayments,
      rejectedPayments,
      paidDues,
      pendingDues,
      overdueDues
    ] = await Promise.all([
      Payment.countDocuments({ status: 'verified' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'rejected' }),
      ResidentDue.find({ status: 'paid' }).lean(),
      ResidentDue.find({ status: 'pending' }).lean(),
      ResidentDue.find({ status: 'overdue' }).lean()
    ]);

    // Calculate totals
    const totalCollected = paidDues.reduce((sum, due) => sum + due.amount, 0);
    const totalPending = pendingDues.reduce((sum, due) => sum + due.amount, 0);
    const totalOverdue = overdueDues.reduce((sum, due) => sum + due.amount, 0);

    res.json({
      success: true,
      data: {
        totalCollected,
        totalPending,
        totalOverdue,
        paymentsVerified: verifiedPayments,
        paymentsPending: pendingPayments,
        paymentsRejected: rejectedPayments,
        duesPaid: paidDues.length,
        duesPending: pendingDues.length,
        duesOverdue: overdueDues.length
      }
    });
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment summary'
    });
  }
});

// ============================================
// 2. GET /api/reports/activity - User activity summary (Admin Only)
// ============================================
router.get('/activity', auth, requireAdmin, reportLimiter, async (req, res) => {
  try {
    // Calculate date ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get user statistics
    const [
      totalUsers,
      activeResidents,
      activeVendors,
      pendingApprovals,
      logins7Days,
      actionsToday
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'resident', status: 'approved' }),
      User.countDocuments({ role: 'vendor', status: 'approved' }),
      User.countDocuments({ status: 'pending' }),
      AuditLog.countDocuments({
        action: 'USER_LOGIN',
        createdAt: { $gte: sevenDaysAgo }
      }),
      AuditLog.countDocuments({
        createdAt: { $gte: todayStart }
      })
    ]);

    // Get action distribution for today
    const actionDistribution = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeResidents,
        activeVendors,
        pendingApprovals,
        logins7Days,
        actionsToday,
        actionDistribution: actionDistribution.map(item => ({
          action: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity summary'
    });
  }
});

// ============================================
// 3. GET /api/reports/payment-trend - Payment trends over time (Admin Only)
// ============================================
router.get('/payment-trend', auth, requireAdmin, reportLimiter, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query; // weekly, monthly, yearly

    let dateFormat;
    let groupBy;
    let startDate;
    const now = new Date();

    // Determine date format and range based on period
    switch (period) {
      case 'weekly':
        dateFormat = '%Y-W%U'; // Year-Week
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'yearly':
        dateFormat = '%Y'; // Year only
        startDate = new Date(now.getFullYear() - 3, 0, 1); // Last 3 years
        groupBy = {
          year: { $year: '$createdAt' }
        };
        break;
      case 'monthly':
      default:
        dateFormat = '%Y-%m'; // Year-Month
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); // Last 12 months
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
    }

    // Aggregate verified payments (collected)
    const collectedTrend = await Payment.aggregate([
      {
        $match: {
          status: 'verified',
          verifiedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 }
      }
    ]);

    // Aggregate pending dues
    const pendingTrend = await ResidentDue.aggregate([
      {
        $match: {
          status: { $in: ['pending', 'overdue'] },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 }
      }
    ]);

    // Format labels and data
    const labels = [];
    const collected = [];
    const pending = [];

    // Create label formatter
    const formatLabel = (id) => {
      if (period === 'yearly') {
        return String(id.year);
      } else if (period === 'weekly') {
        return `W${id.week}-${id.year}`;
      } else {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[id.month - 1]} ${id.year}`;
      }
    };

    // Merge collected and pending data
    const allPeriods = new Set();
    collectedTrend.forEach(item => {
      const label = formatLabel(item._id);
      allPeriods.add(label);
    });
    pendingTrend.forEach(item => {
      const label = formatLabel(item._id);
      allPeriods.add(label);
    });

    // Sort periods chronologically
    const sortedPeriods = Array.from(allPeriods).sort();

    // Build data arrays
    sortedPeriods.forEach(label => {
      labels.push(label);
      
      const collectedItem = collectedTrend.find(item => formatLabel(item._id) === label);
      collected.push(collectedItem ? collectedItem.total : 0);
      
      const pendingItem = pendingTrend.find(item => formatLabel(item._id) === label);
      pending.push(pendingItem ? pendingItem.total : 0);
    });

    res.json({
      success: true,
      data: {
        period,
        labels,
        collected,
        pending
      }
    });
  } catch (error) {
    console.error('Error fetching payment trend:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment trend'
    });
  }
});

// ============================================
// 4. GET /api/reports/recent-payments - Recent payment activity (Admin Only)
// ============================================
router.get('/recent-payments', auth, requireAdmin, reportLimiter, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentPayments = await Payment.find()
      .populate('residentId', 'name email houseNumber')
      .populate({
        path: 'dueId',
        populate: { path: 'chargeId', select: 'title chargeMonth' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: recentPayments
    });
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent payments'
    });
  }
});

export default router;
