import { Redis }from "@upstash/redis";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const OTP_TTL_SECONDS = 300; // 5 minutes
const OTP_DEBUG = false;

// Connect to Upstash Redis
const redis = new Redis({
  url: process.env.KV_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Missing email" });

    const code = crypto.randomInt(100000, 150000).toString();

    // Store OTP in Redis with TTL
    await redis.set(`otp:${email}`, code, { ex: OTP_TTL_SECONDS });

    if (OTP_DEBUG) {
      console.log(`🔐 OTP DEBUG | Email: ${email} | Code: ${code}`);
    } else {
      await resend.emails.send({
        from: "no-reply@karlix.me",
        to: [email],
        subject: "Your Login Verification Code",
        html: `<p>Your verification code is <strong>${code}</strong>. It expires in 5 minutes.</p>`,
      });
    }

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (err: any) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ error: "Server error", message: err.message });
  }
}
