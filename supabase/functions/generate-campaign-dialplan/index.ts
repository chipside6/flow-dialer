import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

interface DialplanRequest {
  campaignId: string;
  userId: string;
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
        JSON.stringify({ 
          success: false, 
          error: "No authorization header", 
          message: "Authentication is required" 
        }),
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid user token",
          message: "User authentication failed" 
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Get request data
    let requestData: DialplanRequest;
    try {
      requestData = await req.json() as DialplanRequest;
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid request format",
          message: "Request body must be valid JSON" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { campaignId, userId } = requestData;
    
    if (!campaignId || !userId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters",
          message: "Both campaignId and userId are required" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify user permissions
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = userProfile?.is_admin === true;
    
    if (userId !== user.id && !isAdmin) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Permission denied",
          message: "You don't have permission to access this resource" 
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Get campaign details with transfer number
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        greeting_file_url,
        goip_device_id,
        goip_devices(id, device_name),
        campaign_ports(port_id)
      `)
      .eq('id', campaignId)
      .maybeSingle();

    if (campaignError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error",
          message: `Error fetching campaign: ${campaignError.message}` 
        }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    if (!campaign) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Campaign not found",
          message: "The requested campaign does not exist or you don't have access to it"
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Get transfer number details
    let transferNumberDetails = null;
    if (campaign.transfer_number) {
      const { data: transferNumber } = await supabase
        .from('transfer_numbers')
        .select('id, name, phone_number')
        .eq('phone_number', campaign.transfer_number)
        .eq('user_id', userId)
        .maybeSingle();
        
      transferNumberDetails = transferNumber;
    }

    // Get port details if available
    let portDetails = [];
    if (campaign.campaign_ports && campaign.campaign_ports.length > 0) {
      const portIds = campaign.campaign_ports.map((p: any) => p.port_id);
      
      const { data: ports } = await supabase
        .from('goip_ports')
        .select('*')
        .in('id', portIds);
        
      if (ports) {
        portDetails = ports;
      }
    }

    // Generate dialplan configuration with transfer capabilities
    const portsList = portDetails.length > 0 
      ? portDetails.map(p => `Port ${p.port_number}`).join(', ') 
      : `Port ${campaign.port_number || 1}`;

    const transferNumberInfo = transferNumberDetails 
      ? `${transferNumberDetails.name} (${transferNumberDetails.phone_number})` 
      : (campaign.transfer_number || "None configured");

    const dialplanConfig = `
; =======================================================================
; Campaign ${campaignId} Production Dialplan Configuration
; =======================================================================
; Created for user ${userId}
; Using: ${portsList}
; Transfer Number: ${transferNumberInfo}
; Generated on: ${new Date().toISOString()}
; =======================================================================

; -------------------------
; Global configuration
; -------------------------
[globals]
CAMPAIGN_ID=${campaignId}
TRANSFER_NUMBER=${campaign.transfer_number || ""}
PORT_NUMBER=${campaign.port_number || 1}
GREETING_FILE=${campaign.greeting_file_url || "beep"}
MAX_RETRIES=3
CALL_TIMEOUT=30

; -------------------------
; Main from-goip context
; -------------------------
[from-goip]
; Handle incoming calls from GoIP device
exten => _X.,1,NoOp(Incoming call from GoIP device)
; Set appropriate caller ID
exten => _X.,n,Set(CALLERID(name)=\${CALLERID(num)})
; Set initial logging variables
exten => _X.,n,Set(CAMPAIGN_LOG_START=\${EPOCH})
exten => _X.,n,Set(CALL_UNIQUE_ID=\${UNIQUEID})
; Process the call in the handler context
exten => _X.,n,Goto(campaign-handler,\${EXTEN},1)

; -------------------------
; Universal campaign handler
; -------------------------
[campaign-handler]
; Process all incoming calls, with error handling
exten => _X.,1,NoOp(Campaign ${campaignId} call handler started)
exten => _X.,n,Answer()
exten => _X.,n,Set(CAMPAIGN_ID=${campaignId})
exten => _X.,n,Set(TRANSFER_NUMBER=${campaign.transfer_number || ""})
exten => _X.,n,Set(PORT_NUMBER=${campaign.port_number || 1})
exten => _X.,n,Set(GREETING_FILE=${campaign.greeting_file_url || "beep"})
; Run Answering Machine Detection with error handling
exten => _X.,n,TrySystem(logger -t asterisk "Running AMD for call \${UNIQUEID}")
exten => _X.,n,AMD()
; Check AMD status and branch accordingly
exten => _X.,n,GotoIf($["\${AMDSTATUS}" = "MACHINE"]?machine:human)

; -------------------------
; Human path handling
; -------------------------
exten => _X.,n(human),NoOp(Human answered - Playing greeting)
; Log the human detection
exten => _X.,n,System(logger -t asterisk "Human detected for call \${UNIQUEID}")
; Try to play the greeting file with error handling
exten => _X.,n,TrySystem(test -f \${GREETING_FILE})
exten => _X.,n,GotoIf($[${SYSTEMSTATUS} = SUCCESS]?play_greeting:use_default)
exten => _X.,n(play_greeting),Playback(\${GREETING_FILE})
exten => _X.,n,Goto(wait_input)
exten => _X.,n(use_default),NoOp(Greeting file not found - using fallback)
exten => _X.,n,System(logger -t asterisk "Warning: Greeting file not found for campaign ${campaignId}")
exten => _X.,n,Playback(beep)
; Wait for transfer selection
exten => _X.,n(wait_input),Read(digit,beep,1)
exten => _X.,n,GotoIf($["\${digit}" = "1"]?transfer:hangup)

; -------------------------
; Machine detection path
; -------------------------
exten => _X.,n(machine),NoOp(Answering machine detected - Hanging up)
exten => _X.,n,System(logger -t asterisk "Machine detected for call \${UNIQUEID}, hanging up")
exten => _X.,n,Set(CALL_RESULT=machine)
exten => _X.,n,Goto(hangup)

; -------------------------
; Call hangup path
; -------------------------
exten => _X.,n(hangup),NoOp(Call ended without transfer)
exten => _X.,n,Set(CALL_DURATION=$[${EPOCH} - ${CAMPAIGN_LOG_START}])
exten => _X.,n,System(logger -t asterisk "Call \${UNIQUEID} ended normally after \${CALL_DURATION} seconds")
exten => _X.,n,Set(CALL_RESULT=completed)
exten => _X.,n,Hangup()

; -------------------------
; Transfer handling
; -------------------------
exten => transfer,1,NoOp(Transferring call to \${TRANSFER_NUMBER})
exten => transfer,n,Set(TRANSFER_ATTEMPT=1)
exten => transfer,n,Set(TRANSFER_START=\${EPOCH})
exten => transfer,n,System(logger -t asterisk "Transferring call \${UNIQUEID} to \${TRANSFER_NUMBER} via port \${PORT_NUMBER}")
; Dial with timeout and transfer flags
exten => transfer,n,Dial(SIP/\${TRANSFER_NUMBER}@goip_${userId}_port\${PORT_NUMBER},\${CALL_TIMEOUT},g)
exten => transfer,n,NoOp(Transfer result: \${DIALSTATUS})
exten => transfer,n,GotoIf($["\${DIALSTATUS}" = "ANSWER"]?transfer_success:transfer_failed)

; -------------------------
; Transfer success path
; -------------------------
exten => transfer,n(transfer_success),NoOp(Transfer successful)
exten => transfer,n,Set(TRANSFER_DURATION=$[${EPOCH} - ${TRANSFER_START}])
exten => transfer,n,System(logger -t asterisk "Transfer successful for call \${UNIQUEID} after \${TRANSFER_DURATION} seconds")
exten => transfer,n,Set(CALL_RESULT=transferred)
exten => transfer,n,Hangup()

; -------------------------
; Transfer failure path with retry
; -------------------------
exten => transfer,n(transfer_failed),NoOp(Transfer failed - \${DIALSTATUS})
exten => transfer,n,System(logger -t asterisk "Transfer failed for call \${UNIQUEID}: \${DIALSTATUS}")
exten => transfer,n,Set(TRANSFER_ATTEMPT=$[\${TRANSFER_ATTEMPT} + 1])
exten => transfer,n,GotoIf($[\${TRANSFER_ATTEMPT} <= \${MAX_RETRIES}]?retry:give_up)
exten => transfer,n(retry),NoOp(Retry transfer attempt \${TRANSFER_ATTEMPT})
exten => transfer,n,Playback(please-wait-moment)
exten => transfer,n,Wait(2)
exten => transfer,n,Goto(transfer,1)
exten => transfer,n(give_up),NoOp(Transfer failed after \${TRANSFER_ATTEMPT} attempts)
exten => transfer,n,Playback(sorry-cant-connect-call)
exten => transfer,n,Set(CALL_RESULT=transfer_failed)
exten => transfer,n,Hangup()

; -------------------------
; Campaign-specific context
; -------------------------
[campaign-${campaignId}]
; Entry point for direct campaign dial
exten => _X.,1,NoOp(Direct campaign ${campaignId} call)
exten => _X.,n,Set(CAMPAIGN_ID=${campaignId})
exten => _X.,n,Set(TRANSFER_NUMBER=${campaign.transfer_number || ""})
exten => _X.,n,Set(PORT_NUMBER=${campaign.port_number || 1})
exten => _X.,n,Set(GREETING_FILE=${campaign.greeting_file_url || "beep"})
exten => _X.,n,Set(CAMPAIGN_LOG_START=\${EPOCH})
exten => _X.,n,Set(CALL_UNIQUE_ID=\${UNIQUEID})
exten => _X.,n,Goto(campaign-handler,\${EXTEN},1)

; -------------------------
; Hangup handler for logging
; -------------------------
exten => h,1,NoOp(Hangup handler: Logging call result)
exten => h,n,GotoIf($["\${CALL_RESULT}" = ""]?missing_result:log_call)
exten => h,n(missing_result),Set(CALL_RESULT=unknown)
exten => h,n(log_call),Set(CALL_DURATION=$[${EPOCH} - ${CAMPAIGN_LOG_START}])
exten => h,n,System(curl -X POST "${Deno.env.get("SUPABASE_URL")}/rest/v1/call_logs" \\
    -H "apikey: ${Deno.env.get("SUPABASE_ANON_KEY")}" \\
    -H "Authorization: Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}" \\
    -H "Content-Type: application/json" \\
    -H "Prefer: return=minimal" \\
    -d "{\\"campaign_id\\":\\"${campaignId}\\",\\"user_id\\":\\"${userId}\\",\\"status\\":\\"\${CALL_RESULT}\\",\\"duration\\":\${CALL_DURATION},\\"phone_number\\":\\"\${CALLERID(num)}\\",\\"transfer_requested\\":\${IF($[\\"${TRANSFER_ATTEMPT}\\" != \\"\\"]?true:false)},\\"transfer_successful\\":\${IF($[\\"${CALL_RESULT}\\" = \\"transferred\\"]?true:false)}}")
`.trim();

    // Log the generation result
    console.log(`Campaign ${campaignId} dialplan generated successfully for user ${userId}`);
    
    // Return the generated configurations with comprehensive metadata
    return new Response(
      JSON.stringify({
        success: true,
        dialplanConfig,
        timestamp: new Date().toISOString(),
        transferEnabled: Boolean(campaign.transfer_number),
        transferNumber: campaign.transfer_number,
        transferNumberName: transferNumberDetails?.name || null,
        portNumber: campaign.port_number || 1,
        campaignTitle: campaign.title,
        version: "2.0-production"
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error generating campaign dialplan:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: String(error),
        message: "Error generating campaign dialplan configuration"
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
