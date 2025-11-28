const express = require('express');
const auth = require('../middleware/auth.js');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload.js');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many upload requests. Please try again later.'
  }
});

router.post('/complaint-image', auth, uploadLimiter, (req, res) => {
  uploadSingle(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, () => {});
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
        mimetype: req.file.mimetype
      }
    });
  });
});

router.post('/complaint-images', auth, uploadLimiter, (req, res) => {
  uploadMultiple(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, () => {});
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const files = req.files.map(f => ({
      filename: f.filename,
      url: `/uploads/complaints/${f.filename}`,
      size: f.size,
      mimetype: f.mimetype
    }));
    return res.json({
      success: true,
      message: `${files.length} image(s) uploaded successfully`,
      data: files
    });
  });
});

module.exports = router;
