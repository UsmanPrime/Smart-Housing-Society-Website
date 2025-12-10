
import express from 'express';
import Complaint from '../models/Complaint.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Facility from '../models/Facility.js';
import Announcement from '../models/Announcement.js';
import auth, { requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/analytics/complaints - Complaints analytics (admin only)
 * Returns aggregate data about complaints
 */
router.get('/complaints', auth, requireRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total complaints
    const totalComplaints = await Complaint.countDocuments(dateFilter);

    // Count by status
    const byStatus = await Complaint.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count by category
    const byCategory = await Complaint.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count by priority
    const byPriority = await Complaint.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average resolution time
    const resolvedComplaints = await Complaint.find({
      ...dateFilter,
      resolvedAt: { $exists: true }
    });

    let avgResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, c) => {
        return sum + (c.resolvedAt - c.createdAt);
      }, 0);
      avgResolutionTime = Math.round((totalTime / resolvedComplaints.length) / (1000 * 60 * 60)); // hours
    }

    // Time series data (complaints over time - last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeSeries = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Vendor performance
    const vendorPerformance = await Complaint.aggregate([
      {
        $match: {
          ...dateFilter,
          assignedTo: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [
                { $in: ['$status', ['resolved', 'closed']] },
                1,
                0
              ]
            }
          },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $ne: ['$resolvedAt', null] },
                { $subtract: ['$resolvedAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      {
        $unwind: '$vendor'
      },
      {
        $project: {
          vendorId: '$_id',
          vendorName: '$vendor.name',
          vendorEmail: '$vendor.email',
          total: 1,
          resolved: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] },
              2
            ]
          },
          avgResolutionTime: {
            $round: [
              { $divide: ['$avgResolutionTime', 1000 * 60 * 60] },
              2
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalComplaints,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byCategory: byCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgResolutionTime,
        timeSeries: timeSeries.map(item => ({
          date: item._id,
          count: item.count
        })),
        vendorPerformance
      }
    });
  } catch (error) {
    console.error('Error fetching complaints analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/analytics/bookings - Bookings analytics (admin only)
 * Returns aggregate data about facility bookings
 */
router.get('/bookings', auth, requireRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total bookings
    const totalBookings = await Booking.countDocuments(dateFilter);

    // Count by status
    const byStatus = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Approval rate
    const approvedCount = byStatus.find(s => s._id === 'approved')?.count || 0;
    const approvalRate = totalBookings > 0 
      ? Math.round((approvedCount / totalBookings) * 100) 
      : 0;

    // Most booked facilities
    const mostBooked = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$facilityId',
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'facilities',
          localField: '_id',
          foreignField: '_id',
          as: 'facility'
        }
      },
      {
        $unwind: '$facility'
      },
      {
        $project: {
          facilityId: '$_id',
          facilityName: '$facility.name',
          category: '$facility.category',
          totalBookings: '$count',
          approvedBookings: '$approved',
          utilizationRate: {
            $round: [
              { $multiply: [{ $divide: ['$approved', '$count'] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 }
    ]);

    // Peak booking hours
    const peakHours = await Booking.aggregate([
      { $match: { ...dateFilter, status: 'approved' } },
      {
        $project: {
          hour: { $hour: '$startTime' }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Bookings by day of week
    const byDayOfWeek = await Booking.aggregate([
      { $match: { ...dateFilter, status: 'approved' } },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: '$startTime' }
        }
      },
      {
        $group: {
          _id: '$dayOfWeek',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Time series data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeSeries = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        approvalRate,
        mostBooked,
        peakHours: peakHours.map(item => ({
          hour: item._id,
          count: item.count,
          label: `${item._id}:00`
        })),
        byDayOfWeek: byDayOfWeek.map(item => ({
          day: dayNames[item._id - 1],
          count: item.count
        })),
        timeSeries: timeSeries.map(item => ({
          date: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching bookings analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/analytics/overview - Dashboard overview (admin only)
 * Returns quick stats for admin dashboard
 */
router.get('/overview', auth, requireRole('admin'), async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalResidents = await User.countDocuments({ role: 'resident' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalAnnouncements = await Announcement.countDocuments();

    const openComplaints = await Complaint.countDocuments({ status: 'open' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        totalComplaints,
        totalBookings,
        totalResidents,
        totalVendors,
        totalAnnouncements,
        openComplaints,
        pendingBookings
      }
    });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overview',
      error: error.message
    });
  }
});

export default router;
