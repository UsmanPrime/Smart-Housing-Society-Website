# 🚀 Deploy Backend to Render - Quick Guide

## Your Backend is NOT deployed on Render!

That's why you're seeing "Cannot connect to server" - the Render URL returns 404.

---

## ✅ EASIEST METHOD: Deploy with Blueprint

### Step 1: Push render.yaml to GitHub

```powershell
cd "e:\OneDrive - FAST National University\FAST\BS (CY)\3rd Semester\Fundamentals Of Software Engineering\Smart Housing Society Website\iteration 1\Smart-Housing-Society-Website"
git add render.yaml
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Deploy on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository: `Smart-Housing-Society-Website`
4. Render will detect `render.yaml` automatically
5. Fill in the required environment variables:
   - `MONGO_URI`: `mongodb+srv://nextgen_admin:admin123@cluster0.b9xgohh.mongodb.net/nextgen-db?appName=Cluster0`
   - `EMAIL_USER`: `uarmy285@gmail.com`
   - `EMAIL_PASS`: `uaclwnzvnjtzudji`
   - `SECURITY_EMAIL`: `blankdude123@gmail.com`
   - `RECEIVER_EMAIL`: `blankdude123@gmail.com`
6. Click "Apply"

### Step 3: Wait for Deployment (3-5 minutes)

Watch the build logs. Once it says "Live", your backend is ready!

---

## 📋 MANUAL METHOD: If Blueprint Doesn't Work

### Step 1: Create New Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository: `Smart-Housing-Society-Website`

### Step 2: Configuration

- **Name**: `nextgen-residency`
- **Region**: Singapore (or closest to you)
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 3: Environment Variables

Click "Advanced" → "Add Environment Variable":

```
MONGO_URI=mongodb+srv://nextgen_admin:admin123@cluster0.b9xgohh.mongodb.net/nextgen-db?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-must-be-different-from-jwt-secret-min-32-characters
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E
EMAIL_USER=uarmy285@gmail.com
EMAIL_PASS=uaclwnzvnjtzudji
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
SECURITY_EMAIL=blankdude123@gmail.com
RECEIVER_EMAIL=blankdude123@gmail.com
FRONTEND_URL=https://nextgen-residency.vercel.app
NODE_ENV=production
```

### Step 4: Create Service

Click "Create Web Service" and wait for deployment.

---

## 🔗 After Deployment

### Your Render URL will be:
`https://nextgen-residency.onrender.com`

### Test it works:
```
https://nextgen-residency.onrender.com/api/health
```

Should return:
```json
{"status":"ok","message":"Server is running","timestamp":"..."}
```

---

## ⚠️ Important Notes

### Free Tier Limitations:
- Service sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- Upgrade to paid plan ($7/month) for always-on

### Auto-Deploy:
- Every push to `main` branch triggers auto-deploy
- Takes 2-3 minutes per deployment

---

## ✅ Success Checklist

- [ ] Render service created and live
- [ ] `/api/health` endpoint returns `{"status":"ok"}`
- [ ] Environment variables configured
- [ ] MongoDB connection successful (check logs)
- [ ] Vercel still points to `https://nextgen-residency.onrender.com`

---

## 🐛 Troubleshooting

### Build Fails:
- Check Render logs for errors
- Ensure `server/package.json` has all dependencies
- Check Node version compatibility

### "Cannot connect to MongoDB":
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
- Confirm MongoDB cluster is running

### Environment Variables Missing:
- Double-check all required vars are set
- No quotes around values
- No trailing spaces

---

**Once Render is deployed, your login will work!** 🎉
