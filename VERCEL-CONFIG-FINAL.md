# ✅ Vercel Backend Configuration - READY TO GO

## Your Backend URL
```
https://nextgen-residency.onrender.com
```

## What You Need To Do (2 Steps)

### Step 1: Update Vercel Environment Variable

1. Go to **https://vercel.com/dashboard**
2. Click your project: **smart-housing-society** (or whatever you named it)
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Find the variable: `VITE_API_BASE_URL`
6. Edit the value - change it to:
   ```
   https://nextgen-residency.onrender.com
   ```
7. Click **Save**
8. Vercel will show: **"✓ Environment variable created"**
9. **Wait 1 minute** - Vercel auto-redeployment in progress

### Step 2: Verify in Browser Console

After Vercel finishes deploying:

1. Visit **https://smart-housing-society.vercel.app**
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste and run this:

```javascript
// Should log your backend URL
console.log('API Base:', import.meta.env.VITE_API_BASE_URL);

// Test connection to backend
fetch(import.meta.env.VITE_API_BASE_URL + '/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ BACKEND CONNECTED:', d))
  .catch(e => console.error('❌ Connection failed:', e.message));
```

**Expected Output:**
```
API Base: https://nextgen-residency.onrender.com
✅ BACKEND CONNECTED: { status: "ok", message: "Server is running" }
```

---

## Quick Test Checklist

- ✅ Backend URL set in Vercel: `https://nextgen-residency.onrender.com`
- ✅ Vercel redeployed (wait 2-3 minutes)
- ✅ Console shows API connection: ✅ BACKEND CONNECTED
- ✅ Try to register/login - should work now!

---

## If Still Not Working

### Test Backend Directly
Visit this in your browser:
```
https://nextgen-residency.onrender.com/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

If you don't see this, backend might still be starting - wait 30 seconds and try again.

### Test API Endpoint
In browser console:
```javascript
fetch('https://nextgen-residency.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123'
  })
})
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error('Error:', e.message));
```

---

## Your Deployment Summary

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | https://smart-housing-society.vercel.app | ✅ Deployed |
| Backend | https://nextgen-residency.onrender.com | ✅ Running |
| Database | MongoDB Atlas | ✅ Configured |

---

**Everything is ready! Just update Vercel and test! 🚀**
