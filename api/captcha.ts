import { VercelRequest, VercelResponse } from "@vercel/node";

interface CaptchaVerifyResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  error_codes?: string[];
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

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "No token provided" });
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY || "",
        response: token,
      }).toString(),
    });

    const data: CaptchaVerifyResponse = await response.json();
    const { success, score, action } = data;

    // reCAPTCHA v3 returns a score between 0 and 1
    // 0 = likely bot, 1 = likely human
    // We'll accept scores above 0.5
    if (success && score >= 0.5 && action === "login") {
      return res.json({ success: true, score });
    } else {
      return res.json({
        success: false,
        score,
        message: "CAPTCHA verification failed",
      });
    }
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
