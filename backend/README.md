# Clothify Backend Server

Local development server for Clothify backend API endpoints.

## Features

- 🔐 reCAPTCHA v3 verification
- 🌐 CORS enabled for local development
- 📝 Request logging
- ❤️ Health check endpoint
- 🔄 Auto-restart with nodemon (dev mode)

## Installation

```bash
npm install
```

## Running

### Production Mode
```bash
npm start
# or
npm run dev
```

### Development Mode (with auto-restart)
```bash
npm run dev:watch
```

## Environment Variables

Required in `.env` (parent directory):

```env
API_PORT=3001
RECAPTCHA_SECRET_KEY=your_secret_key
RECAPTCHA_SCORE_THRESHOLD=0.3
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-12T10:30:45.123Z",
  "service": "Clothify Backend API"
}
```

### CAPTCHA Verification
```
POST /api/captcha
Content-Type: application/json

{
  "token": "reCAPTCHA_token_from_frontend"
}
```

Response (Success):
```json
{
  "success": true,
  "score": 0.95,
  "action": "login"
}
```

Response (Failure):
```json
{
  "success": false,
  "score": 0.2,
  "action": "login",
  "threshold": 0.3,
  "message": "Score 0.200 is below threshold 0.3"
}
```

## Local Development Testing

### 1. Start Backend Server
```bash
npm run dev
```

Output:
```
🚀 Clothify Backend Server
────────────────────────────────────────────────────────
✅ Server running at: http://localhost:3001
📍 API endpoint: http://localhost:3001/api/captcha
🔑 Score threshold: 0.3
⏱️  Started at: 10:30:45 AM
────────────────────────────────────────────────────────
```

### 2. Start Frontend Development
In another terminal:
```bash
npm run dev
```

### 3. Test CAPTCHA
Visit `http://localhost:5173/login` and test the login flow.

## Testing with ngrok

### 1. Start Backend
```bash
npm run dev
```

### 2. Start ngrok (new terminal)
```bash
ngrok http 3001
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### 3. Update Frontend
In `Login.tsx` or `.env`:
```
VITE_API_URL=https://abc123.ngrok.io
```

### 4. Test
Access your frontend and test the CAPTCHA flow with external connectivity.

## Monitoring

The server logs all requests:
```
📨 POST /api/captcha
🔍 Verifying reCAPTCHA token...
📥 Response: success=true, score=0.95, action=login
✅ Token verified successfully
```

## Production Deployment

This is a **local development server only**.

For production, use Vercel Functions:
- API code: `/api/captcha.ts`
- Endpoint: `/api/captcha` (relative)
- Secret key: Set in Vercel environment variables

## Troubleshooting

### CAPTCHA verification fails
- Check `.env` has `RECAPTCHA_SECRET_KEY`
- Verify `RECAPTCHA_SCORE_THRESHOLD` (lower = more lenient)
- Check server logs for Google API response

### Port already in use
```bash
# Change port in .env
API_PORT=3002
```

### Can't connect from frontend
- Ensure CORS is enabled (it is by default)
- Check firewall allows port 3001
- For ngrok, update `VITE_API_URL`

## Notes

- This server uses Express.js for simplicity
- All endpoints require JSON content-type
- CORS is enabled for all origins in development
- Error messages are detailed for debugging

## License

Private - Clothify Project
