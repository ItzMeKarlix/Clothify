import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const { userId, adminEmail, code } = await req.json();

    if (!userId || !adminEmail || !code) {
      return new Response(
        JSON.stringify({ error: "userId, adminEmail, and code are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Delete member request - userId: ${userId}, adminEmail: ${adminEmail}, code: "${code}"`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, unassign all tickets from this employee
    const { error: unassignError } = await supabase
      .from("support_tickets")
      .update({ assigned_to: null })
      .eq("assigned_to", userId);
    
    if (unassignError) {
      console.warn("Failed to unassign tickets:", unassignError);
      // Continue with deletion even if unassign fails
    } else {
      console.log(`Unassigned all tickets from user ${userId}`);
    }

    // Delete the user from auth using service role
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Delete user error:", deleteAuthError);
      return new Response(
        JSON.stringify({ error: deleteAuthError.message || "Failed to delete user" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Delete user_roles entry
    const { error: deleteRoleError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    if (deleteRoleError) {
      console.warn("Failed to delete user role:", deleteRoleError);
    }

    console.log(`Successfully deleted user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Member deleted successfully" }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Error in delete-member function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
