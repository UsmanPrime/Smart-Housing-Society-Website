import express from 'express';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import auth, { requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/vendors - List all vendors (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { specialization, available } = req.query;
    
    let query = { role: 'vendor', status: 'approved' };
    
    if (specialization) {
      query.specialization = specialization;
    }
    
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    const vendors = await User.find(query)
      .select('name email phone specialization isAvailable')
      .sort({ name: 1 });

    // Get complaint counts for each vendor
    const vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const stats = await Complaint.getStatsByUser(vendor._id);
        const statsMap = stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {});

        return {
          ...vendor.toObject(),
          stats: {
            open: statsMap['open'] || 0,
            'in-progress': statsMap['in-progress'] || 0,
            completed: statsMap['completed'] || 0,
            resolved: statsMap['resolved'] || 0,
            closed: statsMap['closed'] || 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: vendorsWithStats
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message
    });
  }
});

// GET /api/vendors/my-work - Get vendor's assigned complaints
router.get('/my-work', auth, requireRole('vendor'), async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { assignedTo: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email phone')
      .sort({ createdAt: -1 });

    // Get status counts
    const stats = await Complaint.getStatsByUser(req.user.id);
    const statsMap = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        complaints,
        stats: {
          total: complaints.length,
          open: statsMap['open'] || 0,
          'in-progress': statsMap['in-progress'] || 0,
          completed: statsMap['completed'] || 0,
          resolved: statsMap['resolved'] || 0,
          closed: statsMap['closed'] || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor work:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned complaints',
      error: error.message
    });
  }
});

// GET /api/vendors/stats - Get vendor statistics (for vendor dashboard)
router.get('/stats', auth, requireRole('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get all complaints assigned to vendor
    const allComplaints = await Complaint.find({ assignedTo: vendorId });
    
    // Calculate statistics
    const total = allComplaints.length;
    const resolved = allComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
    const inProgress = allComplaints.filter(c => c.status === 'in-progress').length;
    const open = allComplaints.filter(c => c.status === 'open').length;
    
    // Calculate average resolution time (for resolved complaints)
    const resolvedComplaints = allComplaints.filter(c => c.resolvedAt);
    let avgResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, c) => {
        const duration = c.resolvedAt - c.createdAt;
        return sum + duration;
      }, 0);
      avgResolutionTime = Math.round((totalTime / resolvedComplaints.length) / (1000 * 60 * 60)); // hours
    }

    // Get today's completed count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = allComplaints.filter(c => 
      (c.status === 'resolved' || c.status === 'closed') && 
      c.resolvedAt && 
      new Date(c.resolvedAt) >= today
    ).length;

    // Get this week's completed count
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const completedThisWeek = allComplaints.filter(c => 
      (c.status === 'resolved' || c.status === 'closed') && 
      c.resolvedAt && 
      new Date(c.resolvedAt) >= weekStart
    ).length;

    // Get complaints by category
    const byCategory = allComplaints.reduce((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1;
      return acc;
    }, {});

    // Get complaints by priority
    const byPriority = allComplaints.reduce((acc, complaint) => {
      acc[complaint.priority] = (acc[complaint.priority] || 0) + 1;
      return acc;
    }, {});

    // Recent activity summary
    const recentActivity = `You have ${open} open tasks, ${inProgress} in progress, and completed ${completedToday} today.`;

    res.json({
      success: true,
      data: {
        totalJobs: total,
        open,
        inProgress,
        completed: resolved,
        pending: open,
        completedToday,
        thisWeek: completedThisWeek,
        avgResolutionTime: avgResolutionTime || null,
        completionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        byCategory,
        byPriority,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// PUT /api/vendors/availability - Toggle vendor availability
router.put('/availability', auth, requireRole('vendor'), async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean value'
      });
    }

    const vendor = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable },
      { new: true }
    ).select('name email isAvailable');

    res.json({
      success: true,
      message: `Availability updated to ${isAvailable ? 'available' : 'unavailable'}`,
      data: vendor
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
      error: error.message
    });
  }
});

export default router;
