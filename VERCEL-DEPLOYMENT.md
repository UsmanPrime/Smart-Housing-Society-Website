# 🚀 Vercel Deployment - Complete Setup Guide

## Status: ✅ Code Ready

Your code is now pushed to GitHub and ready for Vercel deployment!

---

## Step 1: Deploy Frontend on Vercel (5 minutes)

### A. Go to Vercel

1. Open **https://vercel.com**
2. Click "Sign Up" (or "Sign In" if you have an account)
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### B. Create New Project

1. Click "New Project" or "Add New..."
2. Search for your repository: **Smart-Housing-Society-Website**
3. Click "Import"

### C. Configure Project

**Step 1: Project Settings**
- Project Name: `smart-housing-society` (or any name you prefer)
- Framework Preset: **React** (Vercel auto-detects this)
- Root Directory: `./` (leave as is)

**Step 2: Environment Variables**

Add these environment variables:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `http://localhost:5000` (change later) |

**Step 3: Deploy**
- Click **"Deploy"**
- Vercel will build and deploy your frontend
- Wait for the build to complete (2-3 minutes)

### ✅ Your Frontend is LIVE!

After deployment, you'll get:
- **Live URL**: `https://smart-housing-society.vercel.app`
- **Automatic deploys**: Every time you push to GitHub
- **Preview URLs**: For pull requests

---

## Step 2: Deploy Backend (Node.js Server)

You have **2 options**:

### **Option A: Simple - Use Railway.app (Recommended for Backend)**

Railway is easier than Render and perfect for Node.js backends.

#### 1. Sign up
- Go to **https://railway.app**
- Sign up with GitHub
- Authorize Railway

#### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose **Smart-Housing-Society-Website**
4. Select **server/** as root directory

#### 3. Add Environment Variables
Click "Variables" and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-housing
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
NODE_ENV=production
PORT=5000
```

#### 4. Deploy
1. Click "Deploy"
2. Railway auto-detects Node.js
3. Wait for deployment (2-3 minutes)

#### 5. Get Backend URL
- Go to project settings
- Find "Public URL" or "Railway domain"
- Copy the URL (example: `https://smart-housing-api.up.railway.app`)

---

### **Option B: Render.com (Alternative)**

1. Go to **https://render.com**
2. Sign up with GitHub
3. Create "New Web Service"
4. Connect your GitHub repo
5. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables (same as above)
7. Deploy

---

## Step 3: Update Frontend with Backend URL

### Update Environment Variable in Vercel

1. Go to your **Vercel Project Dashboard**
2. Click **Settings** → **Environment Variables**
3. Edit the `VITE_API_BASE_URL` variable
4. Change from `http://localhost:5000` to your backend URL

**Example:**
```
VITE_API_BASE_URL=https://smart-housing-api.up.railway.app
```

4. Click "Save"
5. Vercel will auto-redeploy with the new URL

---

## Step 4: Database Setup (MongoDB)

### Create Free MongoDB Database

1. Go to **https://mongodb.com/cloud/atlas**
2. Sign up (free)
3. Create a new cluster (free tier)
4. Get connection string: `mongodb+srv://...`
5. Add to backend environment variables as `MONGODB_URI`

---

## Step 5: Email Configuration (Optional)

To enable email notifications:

1. Use **Gmail** (recommended):
   - Enable 2-factor authentication
   - Create "App Password": https://myaccount.google.com/apppasswords
   - Use app password in `SMTP_PASS`

2. Or use **SendGrid**, **Mailgun**, etc.

---

## Step 6: Test Your Deployment ✅

### Test Frontend
```
Visit: https://your-project.vercel.app
- Load the home page
- Check console for errors
```

### Test API Connection
```
# Check if backend is responding
curl https://your-backend-url/api/health

# Or visit in browser
https://your-backend-url/api/health
```

### Test Full Flow
1. **Register** a new account
2. **Login** with credentials
3. **Create complaint** (tests API)
4. **Check dashboard** (tests database)
5. **Upload file** (tests file storage)

---

## Troubleshooting

### "Cannot reach API" Error
✅ **Solution:**
1. Check `VITE_API_BASE_URL` in Vercel environment variables
2. Verify backend is running and online
3. Check CORS settings in backend:
   ```js
   // In server.js
   app.use(cors({
     origin: ['https://your-vercel-url.vercel.app', 'http://localhost:3000']
   }));
   ```

### "Database connection failed"
✅ **Solution:**
1. Verify MongoDB connection string is correct
2. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
3. Verify `MONGODB_URI` in backend environment variables

### "Build fails on Vercel"
✅ **Solution:**
1. Check Vercel build logs
2. Run locally: `npm run build`
3. Fix any errors locally first
4. Push to GitHub
5. Vercel will auto-redeploy

### "Pages not loading"
✅ **Solution:**
1. Clear browser cache
2. Check Vercel deployment status
3. Verify all lazy-loaded routes are working
4. Check Network tab in browser dev tools

---

## Your Deployment URLs

After everything is set up, you'll have:

| Component | URL |
|-----------|-----|
| **Frontend** | `https://smart-housing-society.vercel.app` |
| **Backend API** | `https://smart-housing-api.up.railway.app` |
| **Database** | MongoDB Atlas (cloud) |

---

## Automatic Deployments

Every time you push to GitHub:
1. Vercel auto-detects changes
2. Runs `npm run build`
3. Deploys new version
4. Takes ~2-3 minutes

No manual work needed! 🎉

---

## Add Custom Domain (Optional)

### With Vercel
1. Go to Project Settings
2. Domains
3. Add your domain (e.g., `smarthousing.com`)
4. Follow DNS instructions

### Cost
- Domain: $10-15/year (GoDaddy, Namecheap, etc.)
- SSL: Free with Vercel
- Hosting: Free with Vercel

---

## Performance Monitoring

### Check Speed
- Vercel automatically shows: Analytics, Performance, etc.
- Use **https://pagespeed.web.dev** to check speed

### Monitor Backend
- Railway/Render dashboards show logs
- Check error rates, memory usage

---

## Security Checklist

Before going live, verify:

- ✅ JWT_SECRET is strong (32+ characters)
- ✅ MongoDB IP whitelist configured
- ✅ SMTP credentials are correct
- ✅ Environment variables not in code
- ✅ .env file in `.gitignore`
- ✅ CORS allows your Vercel domain
- ✅ HTTPS enabled (automatic)
- ✅ Rate limiting active

---

## Next Steps

1. **Deploy Frontend** on Vercel (right now! 5 min)
2. **Deploy Backend** on Railway (10 min)
3. **Set up MongoDB** (free, 5 min)
4. **Update environment variables** (1 min)
5. **Test everything** (5 min)
6. **Share with friends!** 🎉

---

## Need Help?

| Issue | Help |
|-------|------|
| Vercel | https://vercel.com/docs |
| Railway | https://docs.railway.app |
| MongoDB | https://docs.mongodb.com/atlas |
| React | https://react.dev |

---

**Your website will be live and accessible worldwide in ~15 minutes! 🌍🚀**
