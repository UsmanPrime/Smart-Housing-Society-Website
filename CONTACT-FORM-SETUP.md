# 🏠 Smart Housing Society - Contact Form Backend Setup

## ✅ What I've Done

I've set up a complete backend solution for your contact form that will send emails to your inbox whenever someone submits the form. Here's what was created:

### 📁 New Files Created:

1. **server/server.js** - Backend server with email functionality
2. **server/package.json** - Backend dependencies configuration
3. **server/.env** - Email configuration (YOU NEED TO EDIT THIS!)
4. **server/README.md** - Detailed setup instructions
5. **setup-backend.bat** - One-click setup script
6. **start-servers.bat** - One-click start script for both servers

### 🔄 Updated Files:

1. **src/components/ContactForm.jsx** - Now handles form submission with validation
2. **.gitignore** - Added .env to prevent exposing credentials

---

## 🚀 Quick Start Guide

### Step 1: Configure Your Email

1. Open the file: `server/.env`
2. Replace the placeholder values with your actual email credentials:

```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-gmail-app-password
RECEIVER_EMAIL=your-actual-email@gmail.com
```

### Step 2: Get Gmail App Password

**IMPORTANT:** You need an App Password, NOT your regular Gmail password!

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **Mail** and your device type
5. Click **Generate**
6. Copy the 16-character password (it looks like: `xxxx xxxx xxxx xxxx`)
7. Paste it in the `.env` file as `EMAIL_PASS` (remove spaces)

### Step 3: Install Backend Dependencies

**Option A: Using the Setup Script (Recommended)**
- Double-click `setup-backend.bat`

**Option B: Manual Installation**
```powershell
cd server
npm install
```

### Step 4: Start the Servers

**Option A: Using the Start Script (Recommended)**
- Double-click `start-servers.bat`

**Option B: Manual Start**

Terminal 1 (Backend):
```powershell
cd server
npm start
```

Terminal 2 (Frontend):
```powershell
npm run dev
```

---

## 🧪 Testing

1. Open your browser to the frontend URL (usually `http://localhost:5173`)
2. Navigate to the Contact page
3. Fill out the form:
   - Enter a name
   - Enter an email
   - Enter a phone number (optional)
   - Write a message
   - Check "I'm not a robot"
4. Click "Submit Now"
5. Check your email inbox! 📧

---

## 📋 Features Implemented

✅ Form validation (required fields)
✅ Robot verification checkbox
✅ Loading state during submission
✅ Success/error messages
✅ Email sent to your inbox with formatted template
✅ Form reset after successful submission
✅ Reply-to email set to the sender's email
✅ Beautiful HTML email template

---

## 📧 Email Template

You'll receive emails with:
- Professional formatting
- Contact details (Name, Email, Phone)
- Message content
- Easy reply functionality

---

## 🔧 Troubleshooting

### "Authentication failed" error
- Make sure you're using an **App Password**, not your regular password
- Verify 2-Step Verification is enabled on your Google account
- Check that there are no typos in your `.env` file

### "Network Error" or "Cannot connect"
- Make sure the backend server is running on port 5000
- Check if another application is using port 5000
- Verify your firewall isn't blocking the connection

### Port 5000 already in use
1. Open `server/.env`
2. Change `PORT=5000` to `PORT=5001` (or any other port)
3. Update `ContactForm.jsx` line with axios.post URL to match the new port

### Email not received
- Check your spam folder
- Verify the RECEIVER_EMAIL in `.env` is correct
- Check the backend terminal for error messages

---

## 🛡️ Security Best Practices

⚠️ **IMPORTANT:**
- Never share your `.env` file
- Never commit `.env` to Git (already added to `.gitignore`)
- Use App Passwords instead of regular passwords
- Keep your credentials secure

---

## 📱 Using Other Email Services

### Outlook/Hotmail

In `server/server.js`, change the transporter configuration:

```javascript
const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Yahoo

```javascript
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Custom SMTP

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

---

## 🎯 Next Steps

1. ✅ Configure your email in `server/.env`
2. ✅ Install dependencies (run `setup-backend.bat`)
3. ✅ Start both servers (run `start-servers.bat`)
4. ✅ Test the contact form
5. ✅ Enjoy receiving contact form submissions! 🎉

---

## 📞 Need Help?

If you run into any issues:
1. Check the backend terminal for error messages
2. Verify your `.env` configuration
3. Make sure both servers are running
4. Review the troubleshooting section above

---

**You're all set! Your contact form will now send emails directly to your inbox.** 📬✨
