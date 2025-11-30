import express from 'express';
import auth from '../middleware/auth.js';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.js';
import { virusScanMiddleware } from '../middleware/virusScan.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many upload requests. Please try again later.'
  }
});

router.post(
  '/complaint-image',
  auth,
  uploadLimiter,
  (req, res, next) => uploadSingle(req, res, (err) => (err ? handleUploadError(err, req, res, next) : next())),
  virusScanMiddleware,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    return res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        url: `/uploads/complaints/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }
);

router.post(
  '/complaint-images',
  auth,
  uploadLimiter,
  (req, res, next) => uploadMultiple(req, res, (err) => (err ? handleUploadError(err, req, res, next) : next())),
  virusScanMiddleware,
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const files = req.files.map((f) => ({
      filename: f.filename,
      url: `/uploads/complaints/${f.filename}`,
      size: f.size,
      mimetype: f.mimetype,
    }));
    return res.json({
      success: true,
      message: `${files.length} image(s) uploaded successfully`,
      data: files,
    });
  }
);

export default router;
