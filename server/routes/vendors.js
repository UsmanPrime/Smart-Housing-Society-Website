import express from 'express';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Payout from '../models/Payout.js';
import Payment from '../models/Payment.js';
import ResidentDue from '../models/ResidentDue.js';
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

    // Fetch vendor profile for service category and ratings
    const vendor = await User.findById(vendorId).select('serviceCategory specialization ratingAverage ratingCount services');

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
        recentActivity,
        serviceCategory: vendor?.serviceCategory || null,
        specialization: vendor?.specialization || [],
        ratingAverage: vendor?.ratingAverage || 0,
        ratingCount: vendor?.ratingCount || 0,
        services: vendor?.services || []
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

// PUT /api/vendors/profile - update vendor specific profile fields
router.put('/profile', auth, requireRole('vendor'), async (req, res) => {
  try {
    const { serviceCategory, specialization } = req.body;
    const vendor = await User.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    if (serviceCategory !== undefined) vendor.serviceCategory = serviceCategory;
    if (specialization !== undefined) vendor.specialization = Array.isArray(specialization) ? specialization : [specialization];
    await vendor.save();
    res.json({ success: true, message: 'Profile updated', data: {
      serviceCategory: vendor.serviceCategory,
      specialization: vendor.specialization
    }});
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ success: false, message: 'Error updating vendor profile', error: error.message });
  }
});

// POST /api/vendors/:vendorId/rate - resident rates vendor for completed complaint
router.post('/:vendorId/rate', auth, requireRole('resident'), async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { complaintId, stars, comment } = req.body;
    if (!complaintId || !stars) {
      return res.status(400).json({ success: false, message: 'complaintId and stars are required' });
    }
    if (stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Stars must be between 1 and 5' });
    }
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    if (complaint.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only rate complaints you submitted' });
    }
    if (!complaint.assignedTo || complaint.assignedTo.toString() !== vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor was not assigned to this complaint' });
    }
    if (!['completed', 'resolved', 'closed'].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Complaint must be completed/resolved/closed before rating' });
    }
    // Prevent duplicate rating for same complaint by same user
    const alreadyRated = vendor.ratings?.some(r => r.complaintId.toString() === complaintId && r.residentId.toString() === req.user.id);
    if (alreadyRated) {
      return res.status(400).json({ success: false, message: 'You have already rated this complaint' });
    }
    vendor.ratings.push({ residentId: req.user.id, complaintId, stars, comment });
    vendor.addRating(stars);
    await vendor.save();
    res.status(201).json({ success: true, message: 'Rating submitted', data: {
      ratingAverage: vendor.ratingAverage,
      ratingCount: vendor.ratingCount
    }});
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ success: false, message: 'Error submitting rating', error: error.message });
  }
});

// GET /api/vendors/earnings - vendor earnings summary
router.get('/earnings', auth, requireRole('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;
    // Fetch verified payments tied to dues with this vendor
    const payments = await Payment.find({ status: 'verified' })
      .populate({
        path: 'dueId',
        match: { vendorId },
        populate: { path: 'complaintId', select: 'category resolvedAt status' }
      })
      .lean();

    const filtered = payments.filter(p => p.dueId && p.dueId.vendorId && p.dueId.vendorId.toString() === vendorId);

    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0,0,0,0);
    const startOfWeek = new Date(now); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); startOfWeek.setHours(0,0,0,0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalEarnings = filtered.reduce((sum,p)=> sum + (p.vendorShare || 0),0);
    const todayEarnings = filtered.filter(p=> p.verifiedAt && p.verifiedAt >= startOfToday).reduce((s,p)=>s+(p.vendorShare||0),0);
    const weekEarnings = filtered.filter(p=> p.verifiedAt && p.verifiedAt >= startOfWeek).reduce((s,p)=>s+(p.vendorShare||0),0);
    const monthEarnings = filtered.filter(p=> p.verifiedAt && p.verifiedAt >= startOfMonth).reduce((s,p)=>s+(p.vendorShare||0),0);

    // Category breakdown from complaint category
    const byCategory = filtered.reduce((acc,p)=>{
      const cat = p.dueId?.complaintId?.category || 'other';
      acc[cat] = acc[cat] || { count:0, amount:0 };
      acc[cat].count += 1;
      acc[cat].amount += (p.vendorShare || 0);
      return acc;
    },{});

    // Weekly timeline last 12 weeks using verifiedAt
    const weeklyTimeline = Array.from({length:12}, (_,i)=>{
      const end = new Date(startOfWeek); end.setDate(end.getDate() - 7*i);
      const start = new Date(end); start.setDate(start.getDate()-7);
      const amount = filtered.filter(p=> p.verifiedAt && p.verifiedAt >= start && p.verifiedAt < end).reduce((s,p)=>s+(p.vendorShare||0),0);
      return { label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, amount };
    }).reverse();

    res.json({ success:true, data:{
      totals:{ total: totalEarnings, today: todayEarnings, week: weekEarnings, month: monthEarnings, jobsCompleted: byCategory ? Object.values(byCategory).reduce((s,c)=>s+c.count,0):0 },
      breakdown: byCategory,
      timeline: weeklyTimeline,
      currency:'PKR'
    }});
  } catch (error) {
    console.error('Error fetching vendor earnings:', error);
    res.status(500).json({ success: false, message: 'Error fetching earnings', error: error.message });
  }
});

// GET /api/vendors/:vendorId/ratings - list ratings (vendor can view own; admin can view all)
router.get('/:vendorId/ratings', auth, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findById(vendorId).select('ratings ratingAverage ratingCount role');
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    const isOwner = vendorId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: {
      ratingAverage: vendor.ratingAverage,
      ratingCount: vendor.ratingCount,
      ratings: vendor.ratings
    }});
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ success: false, message: 'Error fetching ratings', error: error.message });
  }
});

// POST /api/vendors/services - add a service (vendor only)
router.post('/services', auth, requireRole('vendor'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Service name is required' });
    const vendor = await User.findById(req.user.id).select('services');
    vendor.services.push({ name, description });
    await vendor.save();
    res.status(201).json({ success: true, message: 'Service added', data: vendor.services });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ success: false, message: 'Error adding service', error: error.message });
  }
});

// GET /api/vendors/services - list own services (vendor only)
router.get('/services', auth, requireRole('vendor'), async (req, res) => {
  try {
    const vendor = await User.findById(req.user.id).select('services');
    res.json({ success: true, data: vendor.services });
  } catch (error) {
    console.error('Error listing services:', error);
    res.status(500).json({ success: false, message: 'Error listing services', error: error.message });
  }
});

// PATCH /api/vendors/services/:index - update service (vendor only by index)
router.patch('/services/:index', auth, requireRole('vendor'), async (req, res) => {
  try {
    const { index } = req.params;
    const { name, description, active } = req.body;
    const vendor = await User.findById(req.user.id).select('services');
    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= vendor.services.length) {
      return res.status(400).json({ success: false, message: 'Invalid service index' });
    }
    if (name !== undefined) vendor.services[idx].name = name;
    if (description !== undefined) vendor.services[idx].description = description;
    if (active !== undefined) vendor.services[idx].active = active;
    await vendor.save();
    res.json({ success: true, message: 'Service updated', data: vendor.services[idx] });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: 'Error updating service', error: error.message });
  }
});

// DELETE /api/vendors/services/:index - remove service
router.delete('/services/:index', auth, requireRole('vendor'), async (req, res) => {
  try {
    const { index } = req.params;
    const vendor = await User.findById(req.user.id).select('services');
    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= vendor.services.length) {
      return res.status(400).json({ success: false, message: 'Invalid service index' });
    }
    vendor.services.splice(idx, 1);
    await vendor.save();
    res.json({ success: true, message: 'Service removed', data: vendor.services });
  } catch (error) {
    console.error('Error removing service:', error);
    res.status(500).json({ success: false, message: 'Error removing service', error: error.message });
  }
});

// POST /api/vendors/payouts/request - vendor requests payout
router.post('/payouts/request', auth, requireRole('vendor'), async (req, res) => {
  try {
    const { amount, method, notes } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }
    const payout = await Payout.create({
      vendorId: req.user.id,
      amount,
      method: method || 'bank-transfer',
      notes,
      status: 'requested',
    });
    res.status(201).json({ success: true, message: 'Payout requested', data: payout });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({ success: false, message: 'Error requesting payout', error: error.message });
  }
});

// GET /api/vendors/payouts/history - vendor payout history
router.get('/payouts/history', auth, requireRole('vendor'), async (req, res) => {
  try {
    const payouts = await Payout.find({ vendorId: req.user.id }).sort({ requestedAt: -1 });
    res.json({ success: true, data: payouts });
  } catch (error) {
    console.error('Error fetching payout history:', error);
    res.status(500).json({ success: false, message: 'Error fetching payout history', error: error.message });
  }
});

// GET /api/vendors/payouts/pending - list pending requests (admin)
router.get('/payouts/pending', auth, requireRole('admin'), async (req, res) => {
  try {
    const pending = await Payout.find({ status: 'requested' }).populate('vendorId', 'name email').sort({ requestedAt: -1 });
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Error fetching pending payouts:', error);
    res.status(500).json({ success: false, message: 'Error fetching pending payouts', error: error.message });
  }
});

// PUT /api/vendors/payouts/:id/approve - admin approves payout
router.put('/payouts/:id/approve', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { adminComment } = req.body;
    const payout = await Payout.findById(id);
    if (!payout || payout.status !== 'requested') {
      return res.status(400).json({ success: false, message: 'Invalid payout request' });
    }
    payout.status = 'approved';
    payout.adminId = req.user.id;
    payout.adminComment = adminComment;
    payout.processedAt = new Date();
    await payout.save();
    res.json({ success: true, message: 'Payout approved', data: payout });
  } catch (error) {
    console.error('Error approving payout:', error);
    res.status(500).json({ success: false, message: 'Error approving payout', error: error.message });
  }
});

// PUT /api/vendors/payouts/:id/reject - admin rejects payout
router.put('/payouts/:id/reject', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { adminComment } = req.body;
    const payout = await Payout.findById(id);
    if (!payout || payout.status !== 'requested') {
      return res.status(400).json({ success: false, message: 'Invalid payout request' });
    }
    payout.status = 'rejected';
    payout.adminId = req.user.id;
    payout.adminComment = adminComment;
    payout.processedAt = new Date();
    await payout.save();
    res.json({ success: true, message: 'Payout rejected', data: payout });
  } catch (error) {
    console.error('Error rejecting payout:', error);
    res.status(500).json({ success: false, message: 'Error rejecting payout', error: error.message });
  }
});

