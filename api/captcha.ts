import { VercelRequest, VercelResponse } from "@vercel/node";

interface TurnstileVerifyResponse {
  success: boolean;
  error_codes?: string[];
  challenge_ts?: string;
  hostname?: string;
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
