# 🔧 Backend Connection Debugging Guide

## Problem: Frontend (Vercel) Cannot Connect to Backend (Render)

---

## Step 1: Get Your Render Backend URL

### Find Your Render URL:

1. Go to **https://dashboard.render.com**
2. Click on your service: **smart-housing-api**
3. Look for **"Public URL"** or **"Service URL"**
4. It will look like: `https://smart-housing-api-xxxx.onrender.com`
5. **Copy this URL** - you'll need it

---

## Step 2: Update Vercel Environment Variable

### Update VITE_API_BASE_URL:

1. Go to **https://vercel.com/dashboard**
2. Click your project: **smart-housing-society**
3. Click **Settings** → **Environment Variables**
4. Find `VITE_API_BASE_URL`
5. Change the value to your **Render URL**

**Example:**
```
VITE_API_BASE_URL = https://smart-housing-api-xxxx.onrender.com
```

6. Click **Save**
7. **Vercel will automatically redeploy** your frontend

---

## Step 3: Check Backend is Running

### Test if Render backend is online:

Open your browser and visit:
```
https://your-render-url/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### If you get an error:
- ✅ Render app might still be starting (wait 30 seconds)
- ✅ Check Render dashboard for deployment errors
- ✅ Check Render logs for issues

---

## Step 4: Check Frontend to Backend Connection

### Open Browser Console:

1. Visit **https://smart-housing-society.vercel.app**
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste and run:

```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// Test API connection
fetch(import.meta.env.VITE_API_BASE_URL + '/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend connected:', d))
  .catch(e => console.error('❌ Connection failed:', e.message));
```

**What to look for:**
- ✅ **"✅ Backend connected"** = Success!
- ❌ **"❌ Connection failed"** = Problem found

---

## Common Issues & Solutions

### Issue 1: "Cannot find module MONGO_URI"

**Problem**: Backend can't connect to MongoDB

**Fix:**
1. Check Render environment variables
2. Verify `MONGODB_URI` is set
3. Check MongoDB Atlas IP whitelist

```bash
# In Render dashboard → Environment Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-housing
```

---

### Issue 2: "CORS Error" in Console

**Problem**: Frontend blocked by CORS policy

**Fix:**
1. ✅ **Already fixed** - Updated server.js CORS
2. Push new code to GitHub:
   ```bash
   git add .
   git commit -m "fix: update CORS configuration for Render"
   git push origin main
   ```
3. Render will auto-redeploy from GitHub

---

### Issue 3: "Failed to fetch" - Connection timeout

**Problem**: Backend URL is wrong or backend is offline

**Debug:**
1. Check exact URL in Render dashboard
2. Test manually: `https://your-render-url/api/health`
3. Wait 30-60 seconds for Render to fully start
4. Check Render deployment status (might be building)

---

### Issue 4: API returns 404 Not Found

**Problem**: Wrong API endpoint or backend routes not loaded

**Fix:**
1. Check backend logs on Render dashboard
2. Verify routes exist in `server/routes/`
3. Restart the Render service

---

## Step-by-Step Connection Test

### 1. Test Backend is Running
```
Browser URL: https://your-render-url/api/health
Expected: { "status": "ok" }
```

### 2. Test Frontend Can Reach Backend
```javascript
// In browser console at https://smart-housing-society.vercel.app
fetch(import.meta.env.VITE_API_BASE_URL + '/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Works:', d))
  .catch(e => console.error('❌ Failed:', e))
```

### 3. Test Authentication API
```javascript
// Try login API call
fetch(import.meta.env.VITE_API_BASE_URL + '/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
  .then(r => r.json())
  .then(d => console.log('✅ API Works:', d))
  .catch(e => console.error('❌ API Failed:', e))
```

---

## Files Modified for CORS Fix

✅ **server/server.js** - Updated CORS configuration to:
- Allow Vercel domain: `https://smart-housing-society.vercel.app`
- Allow localhost for development
- Enable credentials (for cookies)
- Allow all necessary HTTP methods

---

## Quick Checklist

- ✅ Found Render backend URL
- ✅ Updated VITE_API_BASE_URL in Vercel
- ✅ Verified backend is running (`/api/health` works)
- ✅ Checked console for CORS errors
- ✅ Pushed CORS fix to GitHub
- ✅ Render auto-redeployed
- ✅ Tested login/register functionality
- ✅ All working!

---

## Next: Push & Deploy

```bash
# Add and commit the CORS fix
git add server/server.js
git commit -m "fix: CORS configuration for Render backend"
git push origin main

# Render will auto-deploy within 1 minute
```

---

## Contact & Support

If still having issues:

1. **Check Render logs**: Dashboard → Your Service → Logs
2. **Check Vercel logs**: Dashboard → Your Project → Deployments → Logs
3. **Check MongoDB connection**: MongoDB Atlas dashboard
4. **Check environment variables**: Render & Vercel Settings

**Your URL structure should be:**
- Frontend: `https://smart-housing-society.vercel.app`
- Backend: `https://smart-housing-api-xxxx.onrender.com`
- Database: MongoDB Atlas (cloud)

---

## Success Indicators ✅

When everything is working:
- ✅ Home page loads
- ✅ Can register new account
- ✅ Can login
- ✅ Dashboard loads data from API
- ✅ Can create complaints
- ✅ Can upload files
- ✅ No CORS errors in console
- ✅ No network errors

---

**Your website should be fully operational! 🎉**
