import { body, param, query, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validation rules
export const loginValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email too long'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 }).withMessage('Password too long'),
  handleValidationErrors
];

export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email too long'),
  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-()]+$/).withMessage('Invalid phone number'),
  body('houseNumber')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('House number too long'),
  handleValidationErrors
];

export const complaintValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters')
    .escape(),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters')
    .escape(),
  body('category')
    .isIn(['plumbing', 'electrical', 'cleaning', 'maintenance', 'security', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location too long')
    .escape(),
  handleValidationErrors
];

export const paymentValidation = [
  body('amount')
    .isFloat({ min: 0.01, max: 1000000 }).withMessage('Invalid amount'),
  body('dueId')
    .isMongoId().withMessage('Invalid due ID'),
  handleValidationErrors
];

export const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

export const announcementValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('Content must be 10-5000 characters')
    .escape(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  handleValidationErrors
];

export const facilityValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description too long')
    .escape(),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage('Invalid capacity'),
  body('pricePerHour')
    .optional()
    .isFloat({ min: 0, max: 100000 }).withMessage('Invalid price'),
  handleValidationErrors
];
