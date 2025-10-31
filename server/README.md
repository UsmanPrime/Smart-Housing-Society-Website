# Contact Form Backend Setup Instructions

This guide will help you set up the backend server to receive contact form submissions via email.

## 📋 Prerequisites

- Node.js installed on your computer
- A Gmail account (or other email service)

## 🚀 Setup Steps

### 1. Install Backend Dependencies

Open a terminal and navigate to the server folder:

```powershell
cd "E:\OneDrive - FAST National University\FAST\BS (CY)\3rd Semester\Fundamentals Of Software Engineering\Smart Housing Society Website\Smart-Housing-Society-Website\server"
npm install
```

### 2. Configure Email Settings

#### For Gmail Users:

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification" if not already enabled

2. **Generate App Password:**
   - After enabling 2-Step Verification, go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password (remove spaces)

3. **Create/update `.env` file:**
  Copy `server/.env.example` to `server/.env` and replace with real values:
   ```
  EMAIL_USER=your-actual-email@gmail.com
  EMAIL_PASS=your-16-character-app-password   # no spaces
  RECEIVER_EMAIL=your-actual-email@gmail.com
   ```
  Important: do not add inline comments on the same line as values—dotenv treats them as part of the value. Also, Gmail app passwords are shown with spaces, but you must paste them without spaces.

#### For Other Email Services:

If you want to use Outlook, Yahoo, or another service, update `server/server.js`:

**For Outlook/Hotmail:**
```javascript
const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

**For Yahoo:**
```javascript
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### 3. Start the Backend Server

In the server folder, run:

```powershell
npm start
```

Or for development with auto-restart:
```powershell
npm run dev
```

You should see: `Server is running on http://localhost:5000`

### 4. Start the Frontend (In a new terminal)

Navigate to the main project folder:

```powershell
cd "E:\OneDrive - FAST National University\FAST\BS (CY)\3rd Semester\Fundamentals Of Software Engineering\Smart Housing Society Website\Smart-Housing-Society-Website"
npm run dev
```

## ✅ Testing the Contact Form

1. Open your browser and go to your frontend URL (usually `http://localhost:5173`)
2. Navigate to the contact form
3. Fill in all fields:
   - Name
   - Email
   - Phone (optional)
   - Message
4. Check "I'm not a robot"
5. Click "Submit Now"
6. Check your email inbox for the contact form submission!

## 🔧 Troubleshooting

### Error: "Failed to send message"

**Problem:** Email credentials are incorrect

**Solution:** 
- Double-check your `.env` file
- Make sure you're using an App Password, not your regular password
- Verify 2-Step Verification is enabled

### Error: "CORS error" or "Network error"

**Problem:** Backend server is not running

**Solution:** Make sure the backend server is running on port 5000

### Port Already in Use

**Problem:** Port 5000 is already occupied

**Solution:** Change the PORT in `server/.env` to another port (e.g., 5001), and update the frontend axios URL in `ContactForm.jsx` accordingly

## 📁 Project Structure

```
Smart-Housing-Society-Website/
├── src/
│   └── components/
│       └── ContactForm.jsx (Updated with form handling)
└── server/
    ├── server.js (Backend server)
    ├── package.json (Backend dependencies)
    └── .env (Email configuration - DO NOT COMMIT!)
```

## 🔒 Security Notes

- **Never commit the `.env` file** to version control (Git)
- Add `server/.env` to your `.gitignore` file
- Use App Passwords instead of regular passwords
- Keep your email credentials secure

## 📧 Email Template

When a user submits the contact form, you'll receive a nicely formatted email with:
- Contact Details (Name, Email, Phone)
- The message content
- The sender's email in the "Reply-To" field for easy responses

## 🎉 You're All Set!

Your contact form is now fully functional and will send emails directly to your inbox!
