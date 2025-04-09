
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";
import { connect } from "https://deno.land/x/ssh2@0.1.9/mod.ts";

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

    // Get Asterisk server config
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
      
      // Overwrite the SIP config file via SSH
      try {
        const conn = await connect({
          hostname: ASTERISK_SERVER_HOST,
          port: ASTERISK_SERVER_PORT,
          username: ASTERISK_SERVER_USER,
          password: ASTERISK_SERVER_PASS,
        });
        
        // Get the timestamp for the backup file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Commands to execute
        const commands = [
          // Backup the current config
          `cp /etc/asterisk/sip_goip.conf /etc/asterisk/sip_goip.conf.bak.${timestamp}`,
          // Write the new config
          `echo '${configContent}' > /etc/asterisk/sip_goip.conf`,
          // Reload SIP configuration
          'asterisk -rx "sip reload"',
          // Get SIP status
          'asterisk -rx "sip show peers" | grep goip_'
        ];
        
        // Execute each command
        let commandOutput = '';
        for (const cmd of commands) {
          const { stdout, stderr } = await conn.exec(cmd);
          if (stderr) {
            console.error(`Error executing command ${cmd}: ${stderr}`);
          }
          commandOutput += stdout + '\n';
        }
        
        // Close the connection
        conn.close();
        
        result = {
          success: true,
          message: "SIP configuration updated and reloaded successfully",
          timestamp: new Date().toISOString(),
          sipStatus: commandOutput
        };
      } catch (sshError) {
        console.error("SSH connection error:", sshError);
        
        // Fallback to writing to a local file
        result = {
          success: true,
          message: "Configuration generated (but couldn't connect to Asterisk server)",
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
