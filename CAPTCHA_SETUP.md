# reCAPTCHA v3 Implementation Guide

## Overview
This implementation uses Google reCAPTCHA v3 to protect the admin login from bot attacks. When a user clicks "Sign in", they'll see a CAPTCHA verification modal before being allowed to proceed with login.

## Setup Steps

### 1. Get reCAPTCHA Keys
1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "+" to create a new site
3. Enter your domain:
   - Label: `Clothify Admin`
   - reCAPTCHA type: Select **reCAPTCHA v3**
   - Domains: Add your domain (e.g., `clothify.local`, `yourdomain.com`)
4. Accept terms and submit
5. You'll get:
   - **Site Key** (public) - use in frontend
   - **Secret Key** (private) - use in backend only

### 2. Update Environment Variables

**Frontend (.env file):**
```
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

**Backend (.env file in `/api` folder):**
```
RECAPTCHA_SECRET_KEY=your_secret_key_here
PORT=3001
```

### 3. Update Frontend Code

In `src/pages/admin/Login.tsx`, replace the hardcoded keys:

```typescript
// Line ~31: Replace the script src
script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`;

// Line ~66: Replace the execute call
const token = await window.grecaptcha.execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, {
  action: "login",
});
```

### 4. Install Backend Dependencies

```bash
cd api
npm install express cors axios dotenv
```

### 5. Run the Backend Server

```bash
cd api
node captcha-server.js
```

This will start the server on `http://localhost:3001`

### 6. Update API Endpoint (Optional)

If your frontend is served on a different port, update the fetch URL in Login.tsx:

```typescript
// Change this line (~88):
const response = await fetch("/api/verify-captcha", {
// To:
const response = await fetch("http://localhost:3001/api/verify-captcha", {
```

Or configure a proxy in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  }
}
```

## Flow Explanation

1. User enters email and password, clicks "Sign in"
2. Frontend generates reCAPTCHA token silently (v3)
3. CAPTCHA verification modal appears
4. User clicks "Verify"
5. Frontend sends token to backend `/api/verify-captcha`
6. Backend verifies token with Google's servers
7. If score >= 0.5 (likely human), user is logged in
8. If score < 0.5 (likely bot), login is blocked

## reCAPTCHA v3 Scoring

- **1.0** = Very likely human
- **0.5** = Probably human (threshold)
- **0.0** = Very likely bot

Adjust the threshold in `api/captcha-server.js` line 40:
```javascript
if (success && score >= 0.5) {  // Change 0.5 to desired threshold
```

## Testing

Without real reCAPTCHA keys:
1. The frontend will still load and work
2. A test key is provided as a fallback
3. You'll need real keys for production

## Security Notes

- Never expose your Secret Key in frontend code
- Always verify CAPTCHA on the backend
- Use HTTPS in production
- Monitor reCAPTCHA analytics in Google Console
- reCAPTCHA v3 works silently - no user interaction needed for scoring
