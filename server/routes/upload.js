import express from 'express';
import auth from '../middleware/auth.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.js';
import rateLimit from 'express-rate-limit';


const router = express.Router();

// Rate limiter - 10 uploads per 15 minutes per IP
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many upload requests. Please try again later.'
  }
});

/**
 * POST /api/upload/complaint-image
 * Upload single image for complaints
 */
router.post('/complaint-image', auth, uploadLimiter, (req, res) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, () => {});
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file URL
    const fileUrl = `/uploads/complaints/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
});

/**
 * POST /api/upload/complaint-images
 * Upload multiple images for complaints (max 5)
 */
router.post('/complaint-images', auth, uploadLimiter, (req, res) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, () => {});
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Return the file URLs
    const files = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/complaints/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    res.json({
      success: true,
      message: `${files.length} image(s) uploaded successfully`,
      data: files
    });
  });
});

export default router;
