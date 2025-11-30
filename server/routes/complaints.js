import express from 'express';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import auth, { requireRole } from '../middleware/auth.js';
import { notifyComplaintAssignment } from '../utils/notificationService.js';
import ResidentDue from '../models/ResidentDue.js';
import Charge from '../models/Charge.js';

const router = express.Router();

// POST /api/complaints - Create new complaint (residents only)
router.post('/', auth, requireRole(['resident']), async (req, res) => {
  try {
    const { title, category, priority, description, location } = req.body;

    // Validation
    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and description are required'
      });
    }

    const complaint = new Complaint({
      title,
      category,
      priority: priority || 'medium',
      description,
      location,
      submittedBy: req.user.id,
      status: 'open'
    });

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message
    });
  }
});

// GET /api/complaints - List complaints with filters
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, assignedTo, submittedBy, limit = 50, skip = 0 } = req.query;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'resident') {
      // Residents can only see their own complaints
      query.submittedBy = req.user.id;
    } else if (req.user.role === 'vendor') {
      // Vendors can only see complaints assigned to them
      query.assignedTo = req.user.id;
    }
    // Admin can see all complaints (no additional filter)

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo && req.user.role === 'admin') query.assignedTo = assignedTo;
    if (submittedBy && req.user.role === 'admin') query.submittedBy = submittedBy;

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name email phone specialization')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: (parseInt(skip) + complaints.length) < total
      }
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
});

// GET /api/complaints/:id - Get single complaint details
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name email phone specialization')
      .populate('comments.author', 'name');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check permissions
    const isOwner = complaint.submittedBy._id.toString() === req.user.id;
    const isAssigned = complaint.assignedTo && complaint.assignedTo._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
});

// PUT /api/complaints/:id - Update complaint
router.put('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const isOwner = complaint.submittedBy.toString() === req.user.id;
    const isAssigned = complaint.assignedTo && complaint.assignedTo.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isVendor = req.user.role === 'vendor';

    // Define what fields each role can update
    const { title, description, location, status, priority, assignedTo } = req.body;

    if (isAdmin) {
      // Admin can update any field
      if (title) complaint.title = title;
      if (description) complaint.description = description;
      if (location !== undefined) complaint.location = location;
      if (status) {
        const oldStatus = complaint.status;
        complaint.status = status;
        // Log status change as a comment
        if (oldStatus !== status) {
          complaint.comments.push({
            text: `Status changed from ${oldStatus} to ${status}`,
            author: req.user.id,
            authorName: req.user.name || 'Admin'
          });
        }
      }
      if (priority) complaint.priority = priority;
      if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
    } else if (isOwner && req.user.role === 'resident') {
      // Residents can only update their own complaints (limited fields)
      if (title) complaint.title = title;
      if (description) complaint.description = description;
      if (location !== undefined) complaint.location = location;
    } else if (isVendor && isAssigned) {
      // Vendors can only update status to in-progress or completed on assigned complaints
      if (status) {
        // Vendors can only set status to 'in-progress' or 'completed'
        if (!['in-progress', 'completed'].includes(status)) {
          return res.status(403).json({
            success: false,
            message: 'Vendors can only mark tasks as in-progress or completed'
          });
        }
        const oldStatus = complaint.status;
        complaint.status = status;
        if (oldStatus !== status) {
          complaint.comments.push({
            text: `Status updated to ${status}`,
            author: req.user.id,
            authorName: req.user.name || 'Vendor'
          });
        }
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');
    await complaint.populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message
    });
  }
});

// DELETE /api/complaints/:id - Delete complaint (admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message
    });
  }
});

// POST /api/complaints/:id/comments - Add comment to complaint
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user is involved (owner, assigned vendor, or admin)
    const isOwner = complaint.submittedBy.toString() === req.user.id;
    const isAssigned = complaint.assignedTo && complaint.assignedTo.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get user details for proper author name display
    const commenter = await User.findById(req.user.id).select('name role');
    const roleLabel = commenter?.role === 'admin' ? 'Admin' : commenter?.role === 'vendor' ? 'Vendor' : 'Resident';
    const displayName = commenter?.name ? `${commenter.name} (${roleLabel})` : roleLabel;

    complaint.comments.push({
      text: text.trim(),
      author: req.user.id,
      authorName: displayName
    });

    await complaint.save();

    // TODO: Send notification to relevant parties (implement in notificationService)

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: complaint.comments[complaint.comments.length - 1]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
});

// PUT /api/complaints/:id/assign - Assign complaint to vendor (admin only)
router.put('/:id/assign', auth, requireRole('admin'), async (req, res) => {
  try {
    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Verify vendor exists and is a vendor
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID'
      });
    }

    // Check if vendor specializes in this category (optional check)
    if (vendor.specialization && vendor.specialization.length > 0) {
      if (!vendor.specialization.includes(complaint.category)) {
        // Warning but allow assignment
        console.warn(`Vendor ${vendor.name} does not specialize in ${complaint.category}`);
      }
    }

    complaint.assignedTo = vendorId;
    complaint.status = 'in-progress';
    complaint.comments.push({
      text: `Assigned to ${vendor.name}`,
      author: req.user.id,
      authorName: req.user.name || 'Admin'
    });

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');
    await complaint.populate('assignedTo', 'name email specialization');

    // Best-effort: email the assigned vendor
    try {
      if (vendor?.email) {
        notifyComplaintAssignment(complaint._id, vendor.email);
      }
    } catch (e) {
      console.warn('Failed to send assignment email:', e?.message || e);
    }

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning complaint',
      error: error.message
    });
  }
});

export default router;

// PUT /api/complaints/:id/verify-completion - Admin verifies vendor completion and issues payment due
router.put('/:id/verify-completion', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, comment, dueInDays = 7 } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }
    const complaint = await Complaint.findById(id).populate('submittedBy', 'name email houseNumber').populate('assignedTo','_id');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    if (complaint.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Complaint must be completed by vendor before verification' });
    }
    // Calculate shares
    const vendorShare = Math.round(amount * 0.70);
    const adminShare = amount - vendorShare;

    // Create a transient charge (optional grouping) or reuse existing logic; minimal charge
    const charge = await Charge.create({
      title: `Complaint #${complaint._id.toString().slice(-6)} Payment`,
      description: `Payment for resolved complaint '${complaint.title}'`,
      amount,
      chargeMonth: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
      createdBy: req.user.id
    });

    // Create resident due linked to complaint
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(dueInDays));
    const due = await ResidentDue.create({
      chargeId: charge._id,
      complaintId: complaint._id,
      vendorId: complaint.assignedTo?._id || null,
      residentId: complaint.submittedBy._id,
      residentName: complaint.submittedBy.name,
      houseNumber: complaint.submittedBy.houseNumber || 'N/A',
      email: complaint.submittedBy.email,
      amount,
      adminShare,
      vendorShare,
      dueDate
    });

    // Update complaint status and verification metadata
    complaint.status = 'payment-due';
    complaint.verificationComment = comment;
    complaint.verifiedBy = req.user.id;
    complaint.verifiedAt = new Date();
    complaint.totalPaymentAmount = amount;
    complaint.vendorShare = vendorShare;
    complaint.adminShare = adminShare;
    complaint.comments.push({
      text: `Admin verified completion. Payment due created (Amount: ${amount}, Vendor Share: ${vendorShare}, Admin Share: ${adminShare}).`,
      author: req.user.id,
      authorName: req.user.name || 'Admin'
    });
    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint verified and payment due issued',
      data: { complaint, due }
    });
  } catch (error) {
    console.error('Error verifying complaint completion:', error);
    res.status(500).json({ success: false, message: 'Error verifying completion', error: error.message });
  }
});
