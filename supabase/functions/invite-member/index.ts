import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { inviteEmail, role, adminEmail, code } = await req.json();

    if (!inviteEmail || !role || !adminEmail || !code) {
      return new Response(JSON.stringify({ error: "inviteEmail, role, adminEmail and code are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Verify OTP exists and is valid
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', adminEmail.toLowerCase())
      .eq('code', code)
      .single();

    if (otpError || !otpRecord) {
      return new Response(JSON.stringify({ error: 'Invalid or expired verification code' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      // Delete expired OTP
      await supabase.from('otp_codes').delete().eq('id', otpRecord.id);
      return new Response(JSON.stringify({ error: 'Verification code has expired' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Consume OTP
    await supabase.from('otp_codes').delete().eq('id', otpRecord.id);

    // Invite the user using service role
    const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(inviteEmail);
    if (inviteError) {
      console.error('Invite error:', inviteError);
      return new Response(JSON.stringify({ error: inviteError.message || 'Failed to send invite' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Optionally insert role into user_roles (if user object available)
    if (data?.user?.id) {
      const { error: roleError } = await supabase.from('user_roles').insert({ user_id: data.user.id, role }).select();
      if (roleError) console.warn('Failed to set role after invite:', roleError);
    }

    return new Response(JSON.stringify({ success: true, message: 'Invitation sent' }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Error in invite-member function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});