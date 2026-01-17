import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import sendEmail from '../utils/sendEmail.js';
import { verifyRecaptcha } from '../utils/recaptcha.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Contact form validation
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must contain only letters and spaces'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email too long'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]+$/)
    .withMessage('Invalid phone number format'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be 10-2000 characters'),
  body('recaptchaToken')
    .notEmpty()
    .withMessage('reCAPTCHA token is required')
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
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

// POST /api/contact - Receive contact form submissions
router.post(
  '/',
  apiLimiter,
  contactValidation,
  handleValidationErrors,
  async (req, res) => {
    const { name, email, phone, message, recaptchaToken } = req.body;

    try {
      // Verify reCAPTCHA
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.success) {
        return res.status(400).json({
          success: false,
          message: recaptchaResult.error || 'reCAPTCHA verification failed'
        });
      }

      // Always return success to user immediately
      // Email sending happens in background (best-effort)
      const responsePromise = res.status(200).json({
        success: true,
        message: 'Message sent successfully. We will contact you soon.'
      });

      // Send emails in background (don't await)
      setImmediate(async () => {
        // Skip email if not configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          console.warn('⚠️ EMAIL_USER or EMAIL_PASS not configured - skipping contact emails');
          return;
        }

        try {
          // Send email to admin (use RECEIVER_EMAIL override if set)
          const adminEmail = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER || 'admin@nextgen-residency.com';
      const subject = `New Contact Form Submission from ${name}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #001149 0%, #0b1a4a 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">New Contact Form Submission</h2>
          </div>
          
          <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0 0 20px 0; color: #333;">
              <strong>Name:</strong> ${name}
            </p>
            
            <p style="margin: 0 0 20px 0; color: #333;">
              <strong>Email:</strong> <a href="mailto:${email}" style="color: #001149;">${email}</a>
            </p>
            
            ${phone ? `
              <p style="margin: 0 0 20px 0; color: #333;">
                <strong>Phone:</strong> ${phone}
              </p>
            ` : ''}
            
            <div style="margin: 20px 0; padding: 15px; background: white; border-left: 4px solid #001149; border-radius: 4px;">
              <p style="margin: 0; color: #333; white-space: pre-wrap; word-wrap: break-word;">
                <strong>Message:</strong><br/>${message}
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            
            <p style="margin: 0; color: #666; font-size: 12px;">
              <strong>Submitted at:</strong> ${new Date().toLocaleString()}<br/>
              <strong>IP Address:</strong> ${req.ip || 'N/A'}
            </p>
          </div>
        </div>
      `;

      // Send both emails in parallel with short timeouts
          const adminPromise = sendEmail({
            to: adminEmail,
            subject,
            html,
            retries: 1,
            timeoutMs: 8000
          });

          // Send confirmation email to user
          const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #001149 0%, #0b1a4a 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">Thank You for Contacting Us</h2>
          </div>
          
          <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0 0 20px 0; color: #333;">
              Hello ${name},
            </p>
            
            <p style="margin: 0 0 20px 0; color: #333;">
              Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.
            </p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #001149; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                <strong>Your Message Details:</strong>
              </p>
              <p style="margin: 0; color: #333; font-size: 14px; white-space: pre-wrap; word-wrap: break-word;">
                ${message}
              </p>
            </div>
            
            <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
              Best regards,<br/>
              <strong>NextGen Residency Team</strong>
            </p>
          </div>
        </div>
      `;

          const confirmPromise = sendEmail({
            to: email,
            subject: 'We Received Your Message - NextGen Residency',
            html: confirmationHtml,
            retries: 1,
            timeoutMs: 8000
          });

          // Wait up to 8s total for both emails
          const results = await Promise.race([
            Promise.allSettled([adminPromise, confirmPromise]),
            new Promise((resolve) => setTimeout(() => resolve('timeout'), 8000))
          ]);

          // Log results
          if (Array.isArray(results)) {
            const adminResult = results[0];
            const confirmResult = results[1];
            if (adminResult?.status === 'fulfilled' && adminResult?.value?.success) {
              console.log('✅ Contact admin email sent successfully');
            } else {
              console.error('❌ Contact admin email failed:', adminResult?.reason || adminResult?.value);
            }
            if (confirmResult?.status === 'fulfilled' && confirmResult?.value?.success) {
              console.log('✅ Contact confirmation email sent successfully');
            } else {
              console.warn('⚠️ Contact confirmation email failed:', confirmResult?.reason || confirmResult?.value);
            }
          } else {
            console.warn('⏱️ Contact email sending timed out (8s)');
          }
        } catch (bgError) {
          console.error('❌ Background email error:', bgError);
        }
      });

      return responsePromise;
    } catch (error) {
      console.error('Contact form error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.'
      });
    }
  }
);

export default router;
