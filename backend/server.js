#!/usr/bin/env node

/**
 * Clothify Backend Server
 * 
 * Local development server for API endpoints including:
 * - Cloudflare Turnstile verification
 * - Additional backend services
 * 
 * Usage:
 *   npm start              # Production mode
 *   npm run dev            # Development mode
 *   npm run dev:watch      # Development with auto-restart
 * 
 * Environment:
 *   - PORT: 3001 (default)
 *   - TURNSTILE_SECRET_KEY: From .env
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import process from 'process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

// Load environment variables
dotenv.config({ path: envPath });

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Clothify Backend API'
  });
});

// Turnstile verification endpoint
app.post('/api/turnstile', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    if (!TURNSTILE_SECRET_KEY) {
      console.error('❌ TURNSTILE_SECRET_KEY not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    console.log(`🔍 Verifying Cloudflare Turnstile token...`);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();
    const { success, error_codes } = data;

    console.log(`📥 Response: success=${success}, errors=${error_codes?.join(', ') || 'none'}`);

    if (success) {
      console.log(`✅ Turnstile token verified successfully`);
      return res.json({ 
        success: true,
        message: 'Token verified successfully'
      });
    } else {
      console.log(`❌ Token verification failed`);
      return res.status(400).json({
        success: false,
        message: 'Token verification failed',
        error_codes,
      });
    }
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message
  });
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
  console.log('  POST /api/captcha         - CAPTCHA verification');
  console.log('\n🌐 With ngrok:');
  console.log('  Terminal: ngrok http 3001');
  console.log('  Update VITE_API_URL to your ngrok URL');
  console.log('\n⚠️  Development mode - Not for production use\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});
