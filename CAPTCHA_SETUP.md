# Cloudflare Turnstile Implementation Guide

## Overview
This implementation uses Cloudflare Turnstile to protect the admin login from bot attacks. When a user clicks "Sign in", they'll see a CAPTCHA verification modal before being allowed to proceed with login.

## Setup Steps

### 1. Get Turnstile Keys
1. Go to your Cloudflare Dashboard.
2. Navigate to **Turnstile** in the left-hand menu.
3. Click **Add site**.
4. Enter your site name (e.g., `Clothify Admin`).
5. For the domain, enter your frontend's domain (e.g., `localhost`, `yourdomain.com`).
6. Choose the widget type (Managed is recommended).
7. Click **Create**.
8. You'll get:
   - **Site Key** (public) - use in the frontend.
   - **Secret Key** (private) - use in the backend only.

### 2. Update Environment Variables

**Frontend (.env file):**
```
VITE_TURNSTILE_SITE_KEY=your_site_key_here
```

**Backend (.env file in the root of the project):**
```
TURNSTILE_SECRET_KEY=your_secret_key_here
API_PORT=3001
```

### 3. Update Frontend Code

In `src/pages/admin/Login.tsx`, ensure the Turnstile script is loaded and the widget is rendered with your site key.

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

### 5. Run the Backend Server

```bash
cd backend
npm run dev
```

This will start the server on `http://localhost:3001`.

### 6. API Endpoint

The backend server exposes the following endpoint for Turnstile verification:

- **POST** `/api/turnstile`

The frontend sends the Turnstile token to this endpoint, and the backend verifies it with Cloudflare's servers.

## Flow Explanation

1. User enters their email and password and clicks "Sign in".
2. The frontend renders the Turnstile widget.
3. After the user completes the challenge, the frontend receives a token.
4. The frontend sends this token to the backend at `/api/turnstile`.
5. The backend verifies the token with Cloudflare's API.
6. If the token is valid, the user is logged in.
7. If the token is invalid, the login is blocked.

## Security Notes

- Never expose your Secret Key in frontend code.
- Always verify the Turnstile token on the backend.
- Use HTTPS in production.
- Monitor Turnstile analytics in your Cloudflare Dashboard.
