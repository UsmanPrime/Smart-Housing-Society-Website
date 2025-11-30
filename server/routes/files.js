import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import auth from '../middleware/auth.js';
import Complaint from '../models/Complaint.js';
import Payment from '../models/Payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * GET /api/files/complaints/:filename
 * Serve complaint images with authentication
 * Only accessible by: Admin, the complaint creator, or assigned vendor
 */
router.get('/complaints/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/complaints', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Find the complaint associated with this file
    const complaint = await Complaint.findOne({ imageUrl: `uploads/complaints/${filename}` });
    
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Associated complaint not found' });
    }

    // Authorization check
    const isAdmin = req.user.role === 'admin';
    const isOwner = complaint.residentId.toString() === req.user.id;
    const isAssignedVendor = complaint.assignedTo && complaint.assignedTo.toString() === req.user.id;

    if (!isAdmin && !isOwner && !isAssignedVendor) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission to view this file.' 
      });
    }

    // Serve the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving complaint file:', error);
    res.status(500).json({ success: false, message: 'Error serving file' });
  }
});

/**
 * GET /api/files/receipts/:filename
 * Serve payment receipt images with authentication
 * Only accessible by: Admin or the resident who uploaded it
 */
router.get('/receipts/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/receipts', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Find the payment associated with this file
    const payment = await Payment.findOne({ receiptImageUrl: `uploads/receipts/${filename}` });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Associated payment not found' });
    }

    // Authorization check
    const isAdmin = req.user.role === 'admin';
    const isOwner = payment.residentId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have permission to view this file.' 
      });
    }

    // Serve the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving receipt file:', error);
    res.status(500).json({ success: false, message: 'Error serving file' });
  }
});

export default router;
