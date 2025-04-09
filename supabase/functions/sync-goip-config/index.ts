
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  userId: string;
  operation?: 'reload' | 'sync_user' | 'sync_all';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase clients
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false 
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request data
    const requestData: SyncRequest = await req.json();
    const { userId, operation = 'sync_user' } = requestData;
    
    // Verify the user has permission (is either the same user or an admin)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    const isAdmin = userProfile?.is_admin === true;
    
    if (userId !== user.id && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to access this resource" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Asterisk server config from environment variables
    const ASTERISK_SERVER_HOST = Deno.env.get("ASTERISK_SERVER_HOST");
    const ASTERISK_SERVER_USER = Deno.env.get("ASTERISK_SERVER_USER");
    const ASTERISK_SERVER_PASS = Deno.env.get("ASTERISK_SERVER_PASS");
    const ASTERISK_SERVER_PORT = parseInt(Deno.env.get("ASTERISK_SERVER_PORT") || "22");
    
    if (!ASTERISK_SERVER_HOST || !ASTERISK_SERVER_USER || !ASTERISK_SERVER_PASS) {
      return new Response(
        JSON.stringify({ error: "Asterisk server configuration is missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle different operations
    let userTrunks = [];
    let configContent = '';
    let result = {};
    
    switch (operation) {
      case 'sync_all':
        // Only admin can sync all
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: "Only admins can sync all users" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get all user trunks
        const { data: allTrunks, error: trunksError } = await supabase
          .from('user_trunks')
          .select('*');
          
        if (trunksError) {
          throw new Error(`Error fetching trunks: ${trunksError.message}`);
        }
        
        userTrunks = allTrunks || [];
        break;
        
      case 'sync_user':
      default:
        // Get the user's GoIP credentials
        const { data: userTrunksData, error: userTrunksError } = await supabase
          .from('user_trunks')
          .select('*')
          .eq('user_id', userId);
          
        if (userTrunksError) {
          throw new Error(`Error fetching user trunks: ${userTrunksError.message}`);
        }
        
        userTrunks = userTrunksData || [];
        break;
    }
    
    // Generate SIP configuration for each trunk
    if (userTrunks.length > 0) {
      configContent = userTrunks.map(trunk => `
[goip_${trunk.user_id}_port${trunk.port_number}]
type=peer
host=dynamic
port=5060
username=${trunk.sip_user}
secret=${trunk.sip_pass}
context=from-goip
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=invite,port
nat=yes
qualify=yes
directmedia=no
      `.trim()).join('\n\n');
      
      // In production this would connect to Asterisk server via SSH
      // but since we can't use SSH2 in Deno, we'll simulate the operation
      try {
        // Normally we would use SSH to execute these commands
        // Now we just log and return success
        console.log("Would connect to Asterisk server and execute:");
        console.log(`Write config to /etc/asterisk/sip_goip.conf`);
        console.log(`Run: asterisk -rx "sip reload"`);
        
        result = {
          success: true,
          message: "SIP configuration updated and reloaded successfully (simulated)",
          timestamp: new Date().toISOString(),
          configGenerated: configContent
        };
      } catch (error) {
        console.error("Error in simulated Asterisk connection:", error);
        
        result = {
          success: false,
          message: "Error connecting to Asterisk server (simulated)",
          error: String(error),
          config: configContent,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      result = {
        success: false,
        message: "No SIP trunks found for the user",
        timestamp: new Date().toISOString()
      };
    }
    
    // Return the result
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in sync-goip-config function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: String(error),
        message: "An error occurred while syncing GoIP configuration"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
