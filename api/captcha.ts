import { VercelRequest, VercelResponse } from "@vercel/node";

interface TurnstileVerifyResponse {
  success: boolean;
  error_codes?: string[];
  challenge_ts?: string;
  hostname?: string;
}

// Simple in-memory rate limiter
// IP address -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxAttempts: 5, // Max 5 attempts
  windowMs: 15 * 60 * 1000, // Per 15 minutes
};

function getClientIP(req: VercelRequest): string {
  // Try to get IP from headers (Vercel provides it)
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0] : req.socket.remoteAddress;
  return ip || "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // If no record or window expired, reset
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return { allowed: true, remaining: RATE_LIMIT.maxAttempts - 1, resetIn: RATE_LIMIT.windowMs };
  }

  // Check if limit exceeded
  if (record.count >= RATE_LIMIT.maxAttempts) {
    const resetIn = record.resetTime - now;
    return { allowed: false, remaining: 0, resetIn };
  }

  // Increment counter
  record.count++;
  const remaining = RATE_LIMIT.maxAttempts - record.count;
  const resetIn = record.resetTime - now;

  return { allowed: true, remaining, resetIn };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Check rate limit
  const clientIP = getClientIP(req);
  const rateLimitCheck = checkRateLimit(clientIP);

  // Add rate limit headers
  res.setHeader("X-RateLimit-Limit", RATE_LIMIT.maxAttempts.toString());
  res.setHeader("X-RateLimit-Remaining", rateLimitCheck.remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(Date.now() + rateLimitCheck.resetIn).toISOString());

  if (!rateLimitCheck.allowed) {
    console.warn(`⚠️ Rate limit exceeded for IP: ${clientIP}`);
    return res.status(429).json({
      success: false,
      message: "Too many attempts. Please try again later.",
      retryAfter: Math.ceil(rateLimitCheck.resetIn / 1000),
    });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "No token provided" });
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY || "",
        response: token,
      }),
    });

    const data = (await response.json()) as TurnstileVerifyResponse;
    const { success, error_codes } = data;

    if (success) {
      return res.json({ success: true, message: "CAPTCHA verification successful" });
    } else {
      return res.json({
        success: false,
        message: "CAPTCHA verification failed",
        error_codes,
      });
    }
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
