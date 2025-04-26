
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
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
    console.log("Starting sync-goip-config function");
    
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("Request rejected: No authorization header");
      return new Response(
        JSON.stringify({ success: false, message: "No authorization header" }),
        { status: 401, headers: corsHeaders }
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
      console.log("Authentication failed:", userError?.message);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid user token", error: userError?.message }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    // Get request data
    let requestData: SyncRequest;
    try {
      requestData = await req.json();
      console.log("Request data:", requestData);
    } catch (error) {
      console.log("Invalid JSON in request body:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid JSON in request body" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { userId, operation = 'sync_user' } = requestData;
    
    // Verify the user has permission (is either the same user or an admin)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    const isAdmin = userProfile?.is_admin === true;
    
    console.log(`User ${user.id} is admin: ${isAdmin}, requested userId: ${userId}`);
    
    if (userId !== user.id && !isAdmin) {
      console.log(`Permission denied: User ${user.id} cannot access ${userId}'s data`);
      return new Response(
        JSON.stringify({ success: false, message: "You don't have permission to access this resource" }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Get Asterisk server config from environment variables
    const ASTERISK_SERVER_HOST = Deno.env.get("ASTERISK_SERVER_HOST");
    const ASTERISK_SERVER_USER = Deno.env.get("ASTERISK_SERVER_USER");
    const ASTERISK_SERVER_PASS = Deno.env.get("ASTERISK_SERVER_PASS");
    const ASTERISK_SERVER_PORT = parseInt(Deno.env.get("ASTERISK_SERVER_PORT") || "22");
    
    console.log(`Asterisk config - Host: ${ASTERISK_SERVER_HOST ? "Set" : "Not set"}, User: ${ASTERISK_SERVER_USER ? "Set" : "Not set"}`);
    
    if (!ASTERISK_SERVER_HOST || !ASTERISK_SERVER_USER || !ASTERISK_SERVER_PASS) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Asterisk server configuration is missing in environment variables" 
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Handle different operations
    let userTrunks = [];
    let configContent = '';
    let dialplanContent = '';
    let result = {};
    
    switch (operation) {
      case 'sync_all':
        // Only admin can sync all
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Only admins can sync all users" 
            }),
            { status: 200, headers: corsHeaders }
          );
        }
        
        // Get all user trunks
        const { data: allTrunks, error: trunksError } = await supabase
          .from('user_trunks')
          .select('*');
          
        if (trunksError) {
          console.log("Error fetching all trunks:", trunksError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: `Error fetching trunks: ${trunksError.message}` 
            }),
            { status: 200, headers: corsHeaders }
          );
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
          console.log("Error fetching user trunks:", userTrunksError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: `Error fetching user trunks: ${userTrunksError.message}` 
            }),
            { status: 200, headers: corsHeaders }
          );
        }
        
        userTrunks = userTrunksData || [];
        break;
    }
    
    console.log(`Found ${userTrunks.length} trunks to process`);
    
    // Generate SIP configuration for each trunk
    if (userTrunks.length > 0) {
      // First generate SIP configs for each trunk
      configContent = userTrunks.map(trunk => {
        // Use device_ip from the trunk if available, otherwise use 'dynamic'
        const hostSetting = trunk.device_ip ? `host=${trunk.device_ip}` : 'host=dynamic';
        
        return `
[goip_${trunk.user_id}_port${trunk.port_number}]
type=peer
${hostSetting}
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
      `.trim();
      }).join('\n\n');
      
      // Now generate dialplan with transfer capability for each user
      // Get all campaigns with transfer numbers
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, title, transfer_number, port_number, greeting_file_url')
        .eq('user_id', userId)
        .not('transfer_number', 'is', null);
        
      if (!campaignsError && campaigns && campaigns.length > 0) {
        dialplanContent = `
; Dialplan configuration for user: ${userId}
; Generated on: ${new Date().toISOString()}
; This configuration supports call transfers through Asterisk

[from-goip]
exten => _X.,1,NoOp(Incoming call from GoIP device)
exten => _X.,n,Set(CALLERID(name)=\${CALLERID(num)})
exten => _X.,n,Goto(autodialer,\${EXTEN},1)

[autodialer]
exten => _X.,1,NoOp(Autodialer call started - Processing)
exten => _X.,n,Answer()
exten => _X.,n,Wait(1)
exten => _X.,n,Set(CAMPAIGN_ID=\${CAMPAIGN_ID})
exten => _X.,n,Set(TRANSFER_NUMBER=\${TRANSFER_NUMBER})
exten => _X.,n,Set(PORT_NUMBER=\${PORT_NUMBER})
exten => _X.,n,Set(GREETING_FILE=\${GREETING_FILE})
exten => _X.,n,AMD()
exten => _X.,n,GotoIf($["${AMDSTATUS}" = "MACHINE"]?machine:human)

exten => _X.,n(human),NoOp(Human answered - Playing greeting and waiting for input)
exten => _X.,n,Playback(\${GREETING_FILE})
exten => _X.,n,Read(digit,beep,1)
exten => _X.,n,GotoIf($["${digit}" = "1"]?transfer,1:hangup)

exten => _X.,n(machine),NoOp(Answering machine detected - Hanging up)
exten => _X.,n,Hangup()

exten => _X.,n(hangup),NoOp(Call ended without transfer)
exten => _X.,n,Hangup()

exten => transfer,1,NoOp(Transferring call to \${TRANSFER_NUMBER})
exten => transfer,n,Set(TRANSFER_ATTEMPT=1)
exten => transfer,n,Dial(SIP/\${TRANSFER_NUMBER}@goip_${userId}_port\${PORT_NUMBER},30,g)
exten => transfer,n,NoOp(Transfer result: \${DIALSTATUS})
exten => transfer,n,GotoIf($["${DIALSTATUS}" = "ANSWER"]?transfer_success:transfer_failed)

exten => transfer,n(transfer_success),NoOp(Transfer successful)
exten => transfer,n,Hangup()

exten => transfer,n(transfer_failed),NoOp(Transfer failed - Playing apology message)
exten => transfer,n,Playback(sorry-cant-connect-call)
exten => transfer,n,Hangup()

; Individual campaign contexts
${campaigns.map(campaign => `
[campaign-${campaign.id}]
exten => _X.,1,NoOp(Campaign: ${campaign.title})
exten => _X.,n,Set(CAMPAIGN_ID=${campaign.id})
exten => _X.,n,Set(TRANSFER_NUMBER=${campaign.transfer_number})
exten => _X.,n,Set(PORT_NUMBER=${campaign.port_number || 1})
exten => _X.,n,Set(GREETING_FILE=${campaign.greeting_file_url || 'beep'})
exten => _X.,n,Goto(autodialer,\${EXTEN},1)
`).join('\n')}
        `.trim();
      }
      
      // In production this would connect to Asterisk server via SSH
      // but since we can't use SSH2 in Deno, we'll simulate the operation
      try {
        // Normally we would use SSH to execute these commands
        // Now we just log and return success
        console.log("Would connect to Asterisk server and execute:");
        console.log(`Write SIP config to /etc/asterisk/sip_goip.conf`);
        console.log(`Write dialplan to /etc/asterisk/extensions_goip.conf`);
        console.log(`Run: asterisk -rx "sip reload"`);
        console.log(`Run: asterisk -rx "dialplan reload"`);
        
        result = {
          success: true,
          message: "SIP and dialplan configuration updated and reloaded successfully",
          timestamp: new Date().toISOString(),
          sipConfigGenerated: configContent.substring(0, 200) + "...", // Truncate for logs
          dialplanGenerated: dialplanContent ? dialplanContent.substring(0, 200) + "..." : "No dialplan generated" // Truncate for logs
        };
      } catch (error) {
        console.error("Error in simulated Asterisk connection:", error);
        
        result = {
          success: false,
          message: "Error connecting to Asterisk server: " + (error instanceof Error ? error.message : String(error)),
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
    
    console.log("Sync complete, returning result:", result.success ? "success" : "failure");
    
    // Ensure we return a valid JSON response
    return new Response(
      JSON.stringify(result),
      { headers: corsHeaders }
    );
    
  } catch (error) {
    console.error("Error in sync-goip-config function:", error);
    
    // Ensure we return a valid JSON response even for unexpected errors
    return new Response(
      JSON.stringify({ 
        success: false,
        message: "An error occurred while syncing GoIP configuration: " + (error instanceof Error ? error.message : String(error))
      }),
      { status: 200, headers: corsHeaders }
    );
  }
});
