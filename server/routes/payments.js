import express from 'express';
import Charge from '../models/Charge.js';
import ResidentDue from '../models/ResidentDue.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { uploadReceipt, handleUploadError } from '../middleware/upload.js';
import { virusScanMiddleware } from '../middleware/virusScan.js';
import { logAction } from '../utils/auditLogger.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

// Middleware to check if user is resident
const requireResident = (req, res, next) => {
  if (req.user.role !== 'resident') {
    return res.status(403).json({ success: false, message: 'Access denied. Residents only.' });
  }
  next();
};

// ============================================
// 1. POST /api/payments/charges/create - Create new charge (Admin Only)
// ============================================
router.post('/charges/create', auth, requireAdmin, async (req, res) => {
  try {
    const { title, description, amount, chargeMonth, dueDate } = req.body;

    // Validation
    if (!title || !amount || !chargeMonth || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount, charge month, and due date are required'
      });
    }

    // Validate charge month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(chargeMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Charge month must be in YYYY-MM format'
      });
    }

    // Create charge
    const charge = new Charge({
      title,
      description,
      amount,
      chargeMonth,
      createdBy: req.user.id,
      status: 'active'
    });

    await charge.save();

    // Get all approved residents
    const residents = await User.find({ 
      role: 'resident', 
      status: 'approved' 
    }).select('_id name houseNumber email');

    // Create dues for all residents
    const duesPromises = residents.map(resident => {
      const due = new ResidentDue({
        chargeId: charge._id,
        residentId: resident._id,
        residentName: resident.name,
        houseNumber: resident.houseNumber || 'N/A',
        email: resident.email,
        amount,
        dueDate: new Date(dueDate),
        status: 'pending'
      });
      return due.save();
    });

    const createdDues = await Promise.all(duesPromises);

    // Log action
    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CHARGE_CREATED',
      resourceType: 'charge',
      resourceId: charge._id,
      details: {
        title: charge.title,
        amount: charge.amount,
        chargeMonth: charge.chargeMonth,
        residentsCount: residents.length
      },
      req
    });

    res.status(201).json({
      success: true,
      message: `Charge created and assigned to ${residents.length} residents`,
      data: {
        charge,
        assignedCount: residents.length
      }
    });
  } catch (error) {
    console.error('Error creating charge:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating charge'
    });
  }
});

// ============================================
// 2. GET /api/payments/dues/my-dues - Get current user's dues (Resident Only)
// ============================================
router.get('/dues/my-dues', auth, requireResident, async (req, res) => {
  try {
    const { status } = req.query;

    // Build query
    const query = { residentId: req.user.id };
    if (status && ['pending', 'paid', 'overdue'].includes(status)) {
      query.status = status;
    }

    // Fetch dues with charge details
    const dues = await ResidentDue.find(query)
      .populate('chargeId', 'title description chargeMonth')
      .sort({ dueDate: 1 })
      .lean();

    // Check and update overdue status
    const currentDate = new Date();
    const updatedDues = await Promise.all(
      dues.map(async (due) => {
        if (due.status === 'pending' && new Date(due.dueDate) < currentDate) {
          await ResidentDue.findByIdAndUpdate(due._id, { status: 'overdue' });
          due.status = 'overdue';
        }
        return due;
      })
    );

    res.json({
      success: true,
      count: updatedDues.length,
      data: updatedDues
    });
  } catch (error) {
    console.error('Error fetching dues:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dues'
    });
  }
});

// ============================================
// 3. GET /api/payments/dues/:dueId - Get specific due details (Resident/Admin)
// ============================================
router.get('/dues/:dueId', auth, async (req, res) => {
  try {
    const { dueId } = req.params;

    const due = await ResidentDue.findById(dueId)
      .populate('chargeId', 'title description chargeMonth amount')
      .populate('residentId', 'name email houseNumber')
      .lean();

    if (!due) {
      return res.status(404).json({
        success: false,
        message: 'Due not found'
      });
    }

    // Authorization check: only the resident who owns the due or admin can access
    if (req.user.role !== 'admin' && due.residentId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own dues'
      });
    }

    // Get payment history for this due
    const payments = await Payment.find({ dueId: due._id })
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        due,
        payments
      }
    });
  } catch (error) {
    console.error('Error fetching due details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching due details'
    });
  }
});

// ============================================
// 4. POST /api/payments/receipts/upload/:dueId - Upload receipt (Resident Only)
// ============================================
router.post(
  '/receipts/upload/:dueId',
  auth,
  requireResident,
  uploadLimiter,
  (req, res, next) => uploadReceipt(req, res, (err) => (err ? handleUploadError(err, req, res, next) : next())),
  virusScanMiddleware,
  async (req, res) => {
    try {
      const { dueId } = req.params;
      const { amount, transactionDate, transactionTime, remarks } = req.body;

      // Validation
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Receipt image is required'
        });
      }

      if (!amount || !transactionDate || !transactionTime) {
        return res.status(400).json({
          success: false,
          message: 'Amount, transaction date, and time are required'
        });
      }

      // Find the due
      const due = await ResidentDue.findById(dueId);
      if (!due) {
        return res.status(404).json({
          success: false,
          message: 'Due not found'
        });
      }

      // Authorization check
      if (due.residentId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only upload receipts for your own dues'
        });
      }

      // Check if due is already paid
      if (due.status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'This due has already been paid'
        });
      }

      // Create payment record
      const payment = new Payment({
        dueId: due._id,
        residentId: req.user.id,
        amount: parseFloat(amount),
        transactionDate: new Date(transactionDate),
        transactionTime,
        receiptImageUrl: `/uploads/receipts/${req.file.filename}`,
        remarks: remarks || '',
        status: 'pending'
      });

      await payment.save();

      // Log action
      await logAction({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'PAYMENT_UPLOADED',
        resourceType: 'payment',
        resourceId: payment._id,
        details: {
          dueId: due._id,
          amount: payment.amount,
          transactionDate: payment.transactionDate
        },
        req
      });

      return res.status(201).json({
        success: true,
        message: 'Receipt uploaded successfully. Awaiting admin verification.',
        data: payment
      });
    } catch (error) {
      console.error('Error uploading receipt:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while uploading receipt'
      });
    }
  }
);

// ============================================
// 5. GET /api/payments/receipts/pending - Get pending verifications (Admin Only)
// ============================================
router.get('/receipts/pending', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ status: 'pending' })
        .populate('residentId', 'name email houseNumber')
        .populate({
          path: 'dueId',
          populate: { path: 'chargeId', select: 'title chargeMonth' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Payment.countDocuments({ status: 'pending' })
    ]);

    res.json({
      success: true,
      count: payments.length,
      total,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending payments'
    });
  }
});

// ============================================
// 6. PUT /api/payments/verification/verify/:paymentId - Verify payment (Admin Only)
// ============================================
router.put('/verification/verify/:paymentId', auth, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}`
      });
    }

    // Fetch due for distribution shares if complaint-origin
    const due = await ResidentDue.findById(payment.dueId).lean();
    let vendorShare = 0;
    let adminShare = 0;
    if (due) {
      vendorShare = due.vendorShare || Math.round(payment.amount * 0.70);
      adminShare = due.adminShare || (payment.amount - vendorShare);
    } else {
      vendorShare = Math.round(payment.amount * 0.70);
      adminShare = payment.amount - vendorShare;
    }

    // Update payment status and store shares
    payment.status = 'verified';
    payment.vendorShare = vendorShare;
    payment.adminShare = adminShare;
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = new Date();
    await payment.save();

    // Update due status to paid if exists
    if (due) {
      const dueDoc = await ResidentDue.findById(payment.dueId);
      dueDoc.status = 'paid';
      dueDoc.paidAt = new Date();
      await dueDoc.save();
    }

    // If linked to complaint, update complaint paymentId and shares
    if (due?.complaintId) {
      const complaint = await Complaint.findById(due.complaintId);
      if (complaint) {
        complaint.paymentId = payment._id;
        complaint.totalPaymentAmount = payment.amount;
        complaint.vendorShare = vendorShare;
        complaint.adminShare = adminShare;
        // Status can move to resolved after payment verified
        complaint.status = 'resolved';
        complaint.comments.push({
          text: `Payment verified. Vendor Share: ${vendorShare}, Admin Share: ${adminShare}. Complaint marked resolved.`,
          author: req.user.id,
          authorName: req.user.name || 'Admin'
        });
        await complaint.save();
      }
    }

    // Log action
    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PAYMENT_VERIFIED',
      resourceType: 'payment',
      resourceId: payment._id,
      details: {
        dueId: payment.dueId,
        amount: payment.amount,
        vendorShare,
        adminShare,
        residentId: payment.residentId
      },
      req
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment'
    });
  }
});

// ============================================
// 7. PUT /api/payments/verification/reject/:paymentId - Reject payment (Admin Only)
// ============================================
router.put('/verification/reject/:paymentId', auth, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}`
      });
    }

    // Update payment status
    payment.status = 'rejected';
    payment.rejectionReason = rejectionReason;
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = new Date();
    await payment.save();

    // Log action
    await logAction({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PAYMENT_REJECTED',
      resourceType: 'payment',
      resourceId: payment._id,
      details: {
        dueId: payment.dueId,
        amount: payment.amount,
        residentId: payment.residentId,
        rejectionReason
      },
      req
    });

    res.json({
      success: true,
      message: 'Payment rejected',
      data: payment
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting payment'
    });
  }
});

// ============================================
// 8. GET /api/payments/history - Get payment history (Resident Only)
// ============================================
router.get('/history', auth, requireResident, async (req, res) => {
  try {
    const { status, from, to } = req.query;

    // Build query
    const query = { residentId: req.user.id };
    
    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      query.status = status;
    }

    // Date range filter
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'dueId',
        populate: { path: 'chargeId', select: 'title chargeMonth' }
      })
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment history'
    });
  }
});

export default router;
