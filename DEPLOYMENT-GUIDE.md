# 🚀 Deployment Guide - Smart Housing Society Website

## Overview

Your website consists of:
- **Frontend**: React app (built with Vite) - Ready in `dist/` folder
- **Backend**: Node.js Express server - Located in `server/` folder
- **Database**: MongoDB (Atlas recommended)

---

## Quick Start - Best Options

### **Option 1: Vercel (EASIEST - Recommended)**

Best for: Complete beginners, quick deployment

**Frontend Deployment (5 minutes):**

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Click "New Project"
4. Select your GitHub repository
5. Click "Deploy"
6. Done! Your site is live

**Environment Setup:**
```
VITE_API_BASE_URL=https://your-backend-url
```

**Cost**: Free tier available (perfect for projects)

---

### **Option 2: Netlify (EASY - Also Recommended)**

Best for: Simple deployment with good performance

**Frontend Deployment (5 minutes):**

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy"

**Environment Variables:**
```
VITE_API_BASE_URL=https://your-backend-url
```

**Cost**: Free tier available

---

### **Option 3: Render (MODERATE - Full Stack)**

Best for: Both frontend AND backend in one place

**Deploy Everything:**

1. Go to [render.com](https://render.com)
2. Create account
3. Create Web Service for backend:
   - Connect GitHub repository
   - Build command: `cd server && npm install`
   - Start command: `cd server && npm start`
   - Add environment variables (see below)
4. Create Static Site for frontend:
   - Same steps as Netlify
   - `npm run build` + `dist`

**Cost**: Free tier with limitations ($7/month for production)

---

### **Option 4: AWS (PROFESSIONAL)**

Best for: Large scale, production-grade deployment

**Frontend:**
- Use S3 + CloudFront (CDN)
- Cost: ~$1-5/month

**Backend:**
- Use EC2 or Elastic Beanstalk
- Cost: ~$5-20/month

---

## Backend Deployment Details

### Environment Variables Required

Create `.env` file in `server/` folder:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-housing

# JWT Secret
JWT_SECRET=your-super-secret-key-min-32-characters

# Email Configuration
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# File Upload
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=300

# Environment
NODE_ENV=production
PORT=5000
```

### Database Setup

**Using MongoDB Atlas (Free):**

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up free
3. Create a cluster
4. Get connection string: `mongodb+srv://...`
5. Add to `.env` as `MONGODB_URI`

---

## Step-by-Step Deployment - Vercel + Render

### **Step 1: Prepare Frontend**

```bash
# Build already done
npm run build

# Verify dist folder exists with all files
ls dist/
```

### **Step 2: Deploy Frontend (Vercel)**

1. Push code to GitHub:
```bash
git add .
git commit -m "Deployment ready"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-url`
5. Click Deploy

✅ **Frontend live at**: `https://yourproject.vercel.app`

### **Step 3: Deploy Backend (Render)**

1. Go to [render.com](https://render.com)
2. Create New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Name**: `smart-housing-api`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node
5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret
   SMTP_USER=your-email
   SMTP_PASS=your-password
   NODE_ENV=production
   ```
6. Click Deploy

✅ **Backend live at**: `https://smart-housing-api.onrender.com`

### **Step 4: Connect Frontend to Backend**

Update frontend environment variable in Vercel:
- `VITE_API_BASE_URL` = `https://smart-housing-api.onrender.com`

Redeploy frontend

### **Step 5: Test Deployment**

```bash
# Test API
curl https://smart-housing-api.onrender.com/api/health

# Visit frontend
https://yourproject.vercel.app
```

---

## Domain Setup (Optional)

### Connect Custom Domain

**For Vercel:**
1. Go to Project Settings
2. Domains
3. Add your domain
4. Follow DNS instructions

**For Render:**
1. Go to Web Service
2. Settings
3. Add Custom Domain
4. Update DNS records

**Domain providers**: GoDaddy, Namecheap, Google Domains, etc.

---

## Monitoring & Maintenance

### Check Backend Status
```bash
# View logs
tail -f server/logs.txt

# Monitor requests
curl https://your-backend-url/api/health
```

### Update Code
```bash
git add .
git commit -m "Update message"
git push origin main

# Automatically deploys!
```

### View Logs
- **Vercel**: Project → Logs
- **Render**: Service → Logs

---

## Troubleshooting

### Frontend won't connect to API
✓ Check `VITE_API_BASE_URL` in Vercel
✓ Verify backend URL is correct
✓ Check CORS settings in backend

### "Cannot find module" error
✓ Run `npm install` in server folder
✓ Check Node version (need v16+)

### Database connection fails
✓ Verify MongoDB connection string
✓ Check IP whitelist in MongoDB Atlas
✓ Verify credentials in `.env`

### Build fails
✓ Check build logs in Vercel/Render
✓ Run `npm run build` locally to debug
✓ Verify all dependencies installed

---

## Security Checklist

Before deploying:

- ✅ Change `JWT_SECRET` to random string (32+ chars)
- ✅ Enable MongoDB IP whitelist
- ✅ Set strong passwords
- ✅ Enable HTTPS (automatic with Vercel/Render)
- ✅ Configure CORS properly
- ✅ Hide `.env` file (add to `.gitignore`)
- ✅ Enable rate limiting (already done)
- ✅ Set up email verification

---

## Cost Summary

| Service | Component | Cost |
|---------|-----------|------|
| Vercel | Frontend | Free ($20/month pro) |
| Render | Backend | Free ($7/month hobby) |
| MongoDB Atlas | Database | Free (512MB, paid plans available) |
| **Total** | | **Free or ~$7-27/month** |

---

## Post-Deployment

### Monitor Performance
- Check Vercel Analytics
- Monitor Render logs
- Set up error tracking (Sentry)

### Keep Updated
```bash
# Update dependencies
npm update
npm audit fix

# Commit and push
git add . && git commit -m "Updates"
git push origin main
```

### Backup Database
- Configure MongoDB automatic backups
- Export data regularly

---

## Success Criteria ✅

After deployment, verify:

1. ✅ Frontend loads at `https://yourproject.vercel.app`
2. ✅ API responds at backend URL
3. ✅ Login/Register works
4. ✅ Database saves data
5. ✅ Emails send correctly
6. ✅ No console errors
7. ✅ Performance is fast (Lighthouse 75+)
8. ✅ Mobile works perfectly

---

## Next Steps

1. **Choose deployment platform** (Vercel recommended)
2. **Push code to GitHub**
3. **Deploy frontend**
4. **Deploy backend**
5. **Configure environment variables**
6. **Test thoroughly**
7. **Add custom domain** (optional)
8. **Monitor and maintain**

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **React Deployment**: https://react.dev/learn/deployment

**Your website will be live and accessible worldwide! 🌍**
