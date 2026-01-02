import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Missing email' }),
        { status: 400 }
      );
    }

    const code = crypto.randomInt(100000, 999999).toString();

    await resend.emails.send({
      from: 'Clothify <no-reply@karlix.me>', // must be verified
      to: [email],
      subject: 'Your Login Verification Code',
      html: `<p>Your verification code is <strong>${code}</strong>.</p>`,
    });

    return new Response(
      JSON.stringify({ message: 'OTP sent' }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
