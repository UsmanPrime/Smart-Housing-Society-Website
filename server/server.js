import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import announcementsRouter from './routes/announcements.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️  MONGO_URI not set. Please configure server/.env');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully!');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Exit if DB connection fails
  }
}

// Connect to database before starting server
connectDB();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other services like outlook, yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email app password
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Housing Society Backend Server is running!' });
});

// Auth routes
app.use('/api/auth', authRouter);

// Admin routes
app.use('/api/admin', adminRouter);

// Announcements routes
app.use('/api/announcements', announcementsRouter);

// Users (profile) routes
app.use('/api/users', usersRouter);

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and message' 
      });
    }

    // Email content
    // SENDING BEHAVIOR: Uses a fixed SMTP account (EMAIL_USER) to send all contact form submissions
    // to RECEIVER_EMAIL. The 'replyTo' field is set to the form submitter's email address,
    // so when you reply in your inbox, it goes directly to the user who submitted the form.
    const mailOptions = {
      from: process.env.EMAIL_USER,               // Server's authenticated email (sender)
      to: process.env.RECEIVER_EMAIL,             // Your inbox (blankdude123@gmail.com)
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #0b1a4a; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h3 style="color: #0b1a4a; margin-top: 0;">Contact Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Name:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Email:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Phone:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${phone || 'Not provided'}</td>
              </tr>
            </table>
            <h3 style="color: #0b1a4a; margin-top: 30px;">Message:</h3>
            <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0b1a4a; margin: 0;">
              ${message}
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This email was sent from the Smart Housing Society website contact form.</p>
          </div>
        </div>
      `,
      replyTo: email  // When you hit "Reply", it goes to the user's email (not the server email)
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
