# Google reCAPTCHA Setup Guide

This project uses Google reCAPTCHA v2 (checkbox) to protect the login form from bots.

## ✅ Current Status

Your reCAPTCHA is **already configured** with production keys:
- **Frontend (Vercel)**: Site key configured in `.env.production`
- **Backend (Render)**: Secret key configured in `server/.env`

## Deployment Checklist

### Vercel (Frontend)
1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project → **Settings** → **Environment Variables**
3. Ensure this variable is set:
   - `VITE_RECAPTCHA_SITE_KEY` = `6LfjZ0ssAAAAAL1qQMF002uiTFElHuEvEJ-XilhE`
4. Redeploy if needed

### Render (Backend)
1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your backend service → **Environment**
3. Ensure this variable is set:
   - `RECAPTCHA_SECRET_KEY` = `6LfjZ0ssAAAAAOQTbX0yKliCKYZ3p1SRGyb6snFq`
4. Save (auto-redeploys)

## How It Works

1. **Frontend**: Renders Google reCAPTCHA widget on login page
2. **User**: Completes the "I'm not a robot" challenge
3. **Frontend**: Sends reCAPTCHA token + credentials to backend
4. **Backend**: Verifies token with Google API before allowing login
5. **Result**: Bots are blocked, humans can login

## Verifying It's Working

After deploying both services:
1. Visit your Vercel URL (e.g., `https://nextgen-residency.vercel.app/login`)
2. You should see the Google reCAPTCHA checkbox
3. Try logging in without checking the box → Error: "Please verify that you are not a robot"
4. Check the box and login → Should work normally

## Troubleshooting

### reCAPTCHA widget doesn't appear
- Check browser console for errors
- Verify your Vercel domain is added to your reCAPTCHA site settings at https://www.google.com/recaptcha/admin

### "reCAPTCHA verification failed" error
- Ensure environment variables are correctly set in both Vercel and Render
- Check that you're using matching keys (site key in frontend, secret key in backend)
- Verify your domain is whitelisted in Google reCAPTCHA admin console

### Need to regenerate keys?
1. Visit https://www.google.com/recaptcha/admin
2. Find your site or create a new one
3. **reCAPTCHA type**: Select **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
4. **Domains**: Add `nextgen-residency.vercel.app` (and any custom domains)
5. Copy new keys and update environment variables in Vercel and Render
6. Redeploy both services

## Security Notes

- ✅ Site keys are public (safe to commit in `.env.production`)
- ❌ Secret keys are private (NEVER commit `server/.env` to git)
- 🔒 Your `server/.env` should be in `.gitignore`
- 🌍 Make sure all your deployment domains are added to reCAPTCHA admin console

## Resources

- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA v2 Documentation](https://developers.google.com/recaptcha/docs/display)

