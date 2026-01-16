# Render Deployment Setup Guide

## Environment Variables Required

Set these in your **Render Dashboard → Environment**:

### 1. Database
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/housing-society?retryWrites=true&w=majority
```
Get this from MongoDB Atlas (create a free cluster if you don't have one).

### 2. JWT Secrets
Generate secure random strings (at least 32 characters):
```
JWT_SECRET=<your-secure-random-string>
JWT_REFRESH_SECRET=<different-secure-random-string>
```

### 3. Encryption Key
Must be exactly 64 hexadecimal characters (run `node generate-encryption-key.js` locally):
```
ENCRYPTION_KEY=<64-hex-characters>
```

### 4. Frontend URL
```
FRONTEND_URL=https://your-frontend-domain.com
```
Must use HTTPS in production.

### 5. Email Configuration (for notifications)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
SECURITY_EMAIL=security-alerts@gmail.com
```

For Gmail, you need to:
- Enable 2-factor authentication
- Generate an "App Password" (not your regular password)

### 6. Node Environment
```
NODE_ENV=production
PORT=5000
```

### 7. Optional (if using reCAPTCHA)
```
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

## Quick Setup Steps

1. **MongoDB Atlas:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string
   - Whitelist Render's IP (or use 0.0.0.0/0 for all IPs)

2. **Generate Secrets Locally:**
   ```powershell
   node generate-encryption-key.js
   node generate-production-secrets.js
   ```
   Copy the output values.

3. **Set Variables on Render:**
   - Dashboard → Your Service → Environment
   - Add each variable
   - Click "Save Changes"

4. **Deploy:**
   Render will automatically redeploy when you save environment variables.

## Troubleshooting

### Error: "Missing required environment variable: MONGODB_URI"
- Make sure you've added MONGODB_URI in Render's environment variables
- Check for typos in the variable name
- Wait for the service to redeploy after adding variables

### Error: "ENCRYPTION_KEY must be 64 hexadecimal characters"
- Run `node generate-encryption-key.js` locally
- Copy the exact output (should be 64 characters)
- Don't add extra spaces or quotes

### Email not working
- For Gmail, use an App Password, not your regular password
- Enable "Less secure app access" or use OAuth2
- Check SMTP settings for your email provider

## Security Notes

⚠️ **NEVER** commit environment variables to Git
⚠️ Use different secrets for development and production
⚠️ Rotate your secrets periodically
⚠️ Keep your ENCRYPTION_KEY safe - losing it means losing encrypted data

## Support

If deployment still fails:
1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB cluster is accessible from Render
4. Check that your MongoDB connection string includes the database name
