# 🚀 Quick Start Guide - Contact Form Email Setup

## What You Need to Do (3 Steps)

### 1️⃣ Configure Email Sending Account

Open `server\.env` and replace these two values:

```env
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**How to Get a Gmail App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already on)
3. Visit [App Passwords](https://myaccount.google.com/apppasswords)
4. Create a password for "Mail" → Copy the 16-character code (remove spaces)
5. Paste it as `EMAIL_PASS` in `server\.env`

**Note:** `RECEIVER_EMAIL` is already set to `blankdude123@gmail.com` ✅

---

### 2️⃣ Install Dependencies & Start Servers

**Install backend dependencies (first time only):**
```powershell
cd server
npm install
```

**Start the backend server:**
```powershell
cd server
npm start
```
You should see: `Server is running on http://localhost:5000`

**In a NEW terminal, start the frontend:**
```powershell
npm run dev
```
You should see the Vite dev server URL (e.g., `http://localhost:5173`)

---

### 3️⃣ Test the Contact Form

1. Open your browser to the frontend URL
2. Navigate to the Contact page
3. Fill in the form:
   - Name: Test User
   - Email: testuser@example.com
   - Phone: 123-456-7890 (optional)
   - Message: Hello, this is a test!
4. Check "I'm not a robot"
5. Click **Submit Now**
6. ✅ Check your inbox at `blankdude123@gmail.com` (check spam folder too)

---

## 📧 How Email Sending Works (Option A - Implemented)

- **From:** The email is sent using the configured `EMAIL_USER` account (your server's SMTP account)
- **To:** All messages go to `RECEIVER_EMAIL` (blankdude123@gmail.com)
- **Reply-To:** Set to the form submitter's email address
  - When you click "Reply" in your inbox, it goes directly to the user who submitted the form
  - You don't need to copy/paste their email

**Why this approach?**
- ✅ Secure: Users don't provide SMTP credentials
- ✅ Simple: One server account sends all messages
- ✅ Reliable: No authentication issues or deliverability problems
- ✅ Convenient: Reply button works automatically

---

## 🔧 Troubleshooting

### "Authentication failed" error
- Verify you're using an **App Password**, not your regular Gmail password
- Check that 2-Step Verification is enabled
- Make sure there are no typos in `EMAIL_USER` or `EMAIL_PASS`

### Backend won't start / Port 5000 in use
- Change `PORT=5000` to `PORT=5001` in `server\.env`
- Update the axios URL in `src\components\ContactForm.jsx` (line ~100):
  ```javascript
  await axios.post('http://localhost:5001/api/contact', formData);
  ```

### Email not received
- Check spam/junk folder in `blankdude123@gmail.com`
- Look at the backend terminal for error messages
- Verify `RECEIVER_EMAIL=blankdude123@gmail.com` in `server\.env`

---

## 🎉 You're All Set!

Once configured, your contact form will:
1. Accept submissions from users
2. Send formatted emails to `blankdude123@gmail.com`
3. Let you reply directly to users with one click

**No user SMTP credentials needed. No security risks. Just works.** ✨
