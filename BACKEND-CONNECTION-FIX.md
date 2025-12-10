# 🔧 Backend Connection - Diagnostic & Fix

## Problem: Cannot Login (Backend Not Connected)

**Error**: Login fails because frontend cannot reach backend API

---

## Step 1: Check Backend is Running

### Test Backend Directly

Open your browser and visit:
```
https://nextgen-residency.onrender.com/api/health
```

**Expected Result:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

**If you see JSON response**: ✅ Backend is running
**If you see error/blank**: ❌ Backend not responding - contact Render support

---

## Step 2: Check Vercel Environment Variable

This is the MOST LIKELY issue!

### Do This NOW:

1. Go to **https://vercel.com/dashboard**
2. Click your project: **nextgen-residency**
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Look for `VITE_API_BASE_URL`

### What You Should See:
```
Name: VITE_API_BASE_URL
Value: https://nextgen-residency.onrender.com
```

### If Missing or Wrong:

1. Click "Add New" if variable doesn't exist
2. Fill in:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://nextgen-residency.onrender.com`
   - **Environment**: Check all (Production, Preview, Development)
3. Click "Save"

### After Saving:
- ✅ Vercel will automatically redeploy
- ✅ Wait 2-3 minutes for new deployment
- ✅ Website will update automatically
- ✅ Login should now work!

---

## Step 3: Verify in Browser

Once Vercel finishes redeploying:

1. Visit: **https://nextgen-residency.vercel.app/**
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this code:

```javascript
// Check if environment variable is set
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// Test connection to backend
fetch(import.meta.env.VITE_API_BASE_URL + '/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ BACKEND CONNECTED:', d))
  .catch(e => console.error('❌ BACKEND FAILED:', e.message));
```

**Expected Console Output:**
```
API Base URL: https://nextgen-residency.onrender.com
✅ BACKEND CONNECTED: { status: 'ok', message: 'Server is running' }
```

**If you see errors:**
- ❌ "Cannot reach server" = Backend not responding
- ❌ "undefined" = Environment variable not set
- ❌ CORS error = Backend CORS misconfigured

---

## Step 4: Test Login

After backend connection is verified:

1. Go to **https://nextgen-residency.vercel.app/**
2. Click **Login**
3. Enter test credentials:
   - Email: any registered email
   - Password: correct password
4. Click **Login**

**Expected:**
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ See your name in header

**If still failing:**
- Check browser Network tab (F12 → Network)
- Look for failed API requests
- Check response errors
- Report exact error message

---

## Troubleshooting Checklist

### Backend Health
- [ ] Can reach `https://nextgen-residency.onrender.com/api/health`
- [ ] Returns JSON response
- [ ] No error messages
- [ ] Response time < 2 seconds

### Vercel Environment
- [ ] `VITE_API_BASE_URL` is set in Vercel dashboard
- [ ] Value is `https://nextgen-residency.onrender.com`
- [ ] Environment includes "Production"
- [ ] Variable saved successfully

### Frontend
- [ ] Browser console shows correct API URL
- [ ] Console shows "✅ BACKEND CONNECTED"
- [ ] No CORS errors in console
- [ ] No other red errors

### Login Test
- [ ] Can access login page
- [ ] Form submits without JS errors
- [ ] Backend receives request (check Network tab)
- [ ] Backend returns response

---

## Common Issues & Solutions

### Issue 1: API URL is `undefined`
**Cause**: Environment variable not set in Vercel

**Solution**:
1. Go to Vercel Settings → Environment Variables
2. Add `VITE_API_BASE_URL = https://nextgen-residency.onrender.com`
3. Save and redeploy
4. Wait 3 minutes

### Issue 2: CORS Error
**Error**: "Access to XMLHttpRequest blocked by CORS policy"

**Cause**: Backend CORS not configured for your Vercel domain

**Solution**:
✅ Already fixed in server.js
- Make sure latest code is deployed to Render
- Render should auto-deploy from GitHub
- Check Render deployment logs

### Issue 3: "Cannot reach server"
**Cause**: Backend is offline or not responding

**Solution**:
1. Check Render dashboard
2. Verify backend is running
3. Check Render logs for errors
4. Restart service if needed

### Issue 4: Login fails but API works
**Cause**: MongoDB not connected or wrong credentials

**Solution**:
1. Check Render environment variables
2. Verify `MONGODB_URI` is set
3. Check MongoDB Atlas connection
4. Verify database credentials

---

## Quick Fix Checklist (Do This Now!)

1. ✅ Open **https://vercel.com/dashboard**
2. ✅ Select **nextgen-residency** project
3. ✅ Go to **Settings → Environment Variables**
4. ✅ Check if `VITE_API_BASE_URL` exists
5. ✅ If missing, add it: `https://nextgen-residency.onrender.com`
6. ✅ Click Save
7. ✅ Wait 2-3 minutes for redeploy
8. ✅ Test login again

**Most likely this will fix your issue!**

---

## If Still Not Working

### Check These Logs:

**Vercel Logs:**
1. Go to https://vercel.com/dashboard
2. Click nextgen-residency project
3. Click "Deployments" tab
4. Click latest deployment
5. Scroll down to see build/runtime logs

**Render Logs:**
1. Go to https://dashboard.render.com
2. Click your service
3. Click "Logs" tab
4. Look for error messages

**Browser Console:**
1. Press F12
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for failed requests

---

## Support

**Stuck?** Try these:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Try in incognito/private mode
4. Check on different browser
5. Restart your browser

**Still failing?** Share:
- Error message from console
- Screenshot of Network tab
- Your Vercel environment variables
- Your Render logs

---

## Expected Timeline

- ✅ Set environment variable: **1 minute**
- ✅ Vercel redeploy: **2-3 minutes**
- ✅ Backend connection restored: **immediately**
- ✅ Login working: **right after**

**Total time: 5 minutes max!**

---

**Do the quick fix above and let me know if login works! 🚀**
