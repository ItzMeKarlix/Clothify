#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import process from 'process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

// Load environment variables
dotenv.config({ path: envPath });

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
  ...(process.env.NGROK_URL ? [process.env.NGROK_URL] : []),
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error(`CORS policy violation: Origin ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Clothify Backend API' });
});

// Turnstile verification
app.post('/api/turnstile', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'No token provided' });
    if (!TURNSTILE_SECRET_KEY) return res.status(500).json({ success: false, message: 'Server configuration error' });

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: TURNSTILE_SECRET_KEY, response: token }),
    });

    const data = await response.json();
    if (data.success) return res.json({ success: true, message: 'Token verified successfully' });
    return res.status(400).json({ success: false, message: 'Token verification failed', error_codes: data.error_codes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not Found', path: req.path, method: req.method }));

// Error handler
app.use((err, req, res) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log('\n');
  console.log('🚀 Clothify Backend Server');
  console.log('━'.repeat(60));
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log(`📍 Turnstile verification endpoint: http://localhost:${PORT}/api/turnstile`);
  console.log(`⏱️  Started at: ${new Date().toLocaleTimeString()}`);
  console.log('━'.repeat(60));
  console.log('\n💡 Available endpoints:');
  console.log('  GET  /health              - Server health check');
  console.log('  POST /api/turnstile       - CAPTCHA verification');
  console.log('\n🌐 With ngrok:');
  console.log('  Terminal: ngrok http 3001');
  console.log('  Update VITE_API_URL to your ngrok URL');
  console.log('\n⚠️  Development mode - Not for production use\n');
});

// Graceful shutdown
process.on('SIGTERM', () => { console.log('Shutting down'); process.exit(0); });
process.on('SIGINT', () => { console.log('Shutting down'); process.exit(0); });
