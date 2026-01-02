-- OTP Codes Table for MFA verification
-- Run this in your Supabase SQL Editor

-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Enable RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (edge functions use service role)
-- No policies needed as we use service role key in edge functions

-- Auto-cleanup expired OTPs (optional - run periodically)
-- DELETE FROM otp_codes WHERE expires_at < NOW();
