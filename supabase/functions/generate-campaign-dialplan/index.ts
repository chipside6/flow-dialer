
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
        JSON.stringify({ error: "No authorization header" }),
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
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Get request data
    const { campaignId, userId } = await req.json() as DialplanRequest;

    // Verify user permissions
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = userProfile?.is_admin === true;
    
    if (userId !== user.id && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to access this resource" }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Get campaign details with transfer number
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        port_ids,
        goip_device(id, device_name),
        transfer_numbers(id, phone_number, name)
      `)
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Extract transfer number (either directly from campaign or from join)
    let transferNumber = campaign.transfer_number;
    if (campaign.transfer_numbers && campaign.transfer_numbers.phone_number) {
      transferNumber = campaign.transfer_numbers.phone_number;
    }

    // Get port details if available
    let portDetails = [];
    if (campaign.port_ids && campaign.port_ids.length > 0) {
      const { data: ports } = await supabase
        .from('goip_ports')
        .select('*')
        .in('id', campaign.port_ids);
        
      if (ports) {
        portDetails = ports;
      }
    }

    // Generate AGI script for transfer handling
    const agiScript = `#!/usr/bin/env php
<?php

require_once('phpagi.php');

// Initialize AGI
$agi = new AGI();
$agi->verbose("Campaign Transfer Handler Started");

// Get the dialed number
$dialed_number = $agi->request['agi_dnid'];
$campaign_id = '${campaignId}';
$greeting_url = '${campaign.greeting_file_url || "beep"}';
$transfer_number = '${transferNumber || ""}';
$port_number = ${campaign.port_number || 1};

// Log call start
$start_time = time();
$agi->verbose("Call started to $dialed_number for campaign $campaign_id");

// Run Answering Machine Detection
$agi->exec('AMD');
$amd_status = $agi->get_variable('AMDSTATUS');
$amd_cause = $agi->get_variable('AMDCAUSE');

$agi->verbose("AMD Result: Status=" . $amd_status['data'] . ", Cause=" . $amd_cause['data']);

// If answering machine detected, hang up
if ($amd_status['data'] === 'MACHINE') {
    $agi->verbose("Answering machine detected, hanging up");
    logCallResult('machine', $start_time);
    $agi->hangup();
    exit;
}

// If human answered, play greeting
if ($amd_status['data'] === 'HUMAN') {
    $agi->verbose("Human answered, playing greeting");
    $agi->stream_file($greeting_url);
    
    // Wait for keypress
    $agi->verbose("Waiting for transfer keypress (1)");
    $result = $agi->get_data('beep', 5000, 1);
    
    if ($result['result'] === '1') {
        $agi->verbose("User pressed 1, transferring to $transfer_number");
        
        // Set variables for the transfer
        $agi->set_variable('TRANSFER_REQUESTED', '1');
        $agi->set_variable('TRANSFER_DESTINATION', $transfer_number);
        $agi->set_variable('PORT_NUMBER', $port_number);
        
        // Execute the transfer
        $agi->verbose("Dialing transfer number using port $port_number");
        $agi->exec('Dial', "SIP/$transfer_number@goip_${userId}_port$port_number,30,g");
        
        // Check transfer status
        $dialstatus = $agi->get_variable('DIALSTATUS');
        $agi->verbose("Transfer dial status: " . $dialstatus['data']);
        
        if ($dialstatus['data'] === 'ANSWER') {
            logCallResult('transferred', $start_time);
            $agi->verbose("Transfer successful");
        } else {
            logCallResult('transfer_failed', $start_time);
            $agi->verbose("Transfer failed: " . $dialstatus['data']);
            
            // Play apology message
            $agi->stream_file('sorry-cant-connect-call');
        }
    } else {
        $agi->verbose("No keypress received");
        logCallResult('no_transfer', $start_time);
    }
}

$agi->hangup();

// Log call result to Supabase
function logCallResult($result, $start_time) {
    global $campaign_id, $dialed_number;
    
    $duration = time() - $start_time;
    
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => '${Deno.env.get("SUPABASE_URL")}/rest/v1/call_logs',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => json_encode([
            'campaign_id' => $campaign_id,
            'status' => $result,
            'duration' => $duration,
            'phone_number' => $dialed_number,
            'transfer_requested' => $result === 'transferred' || $result === 'transfer_failed',
            'transfer_successful' => $result === 'transferred'
        ]),
        CURLOPT_HTTPHEADER => [
            'apikey: ${Deno.env.get("SUPABASE_ANON_KEY")}',
            'Authorization: Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}',
            'Content-Type: application/json',
            'Prefer: return=minimal'
        ],
    ]);
    
    curl_exec($curl);
    curl_close($curl);
}
`;

    // Generate dialplan configuration with transfer capabilities
    const portsList = portDetails.length > 0 
      ? portDetails.map(p => `Port ${p.port_number}`).join(', ') 
      : `Port ${campaign.port_number || 1}`;

    const transferNumberInfo = campaign.transfer_numbers 
      ? `${campaign.transfer_numbers.name} (${campaign.transfer_numbers.phone_number})` 
      : (transferNumber || "None configured");

    const dialplanConfig = `
; Campaign ${campaignId} Dialplan with Transfer Capabilities
; Created for user ${userId}
; Using: ${portsList}
; Transfer Number: ${transferNumberInfo}
; Generated on: ${new Date().toISOString()}

[from-goip]
exten => _X.,1,NoOp(Incoming call from GoIP device)
exten => _X.,n,Set(CALLERID(name)=\${CALLERID(num)})
exten => _X.,n,AGI(campaign_handler.php,\${EXTEN},${campaignId})
exten => _X.,n,Hangup()

[campaign-${campaignId}]
; Handle outbound calls for campaign ${campaignId}
exten => _X.,1,NoOp(Campaign ${campaignId} call handler)
exten => _X.,n,Answer()
exten => _X.,n,AMD()
exten => _X.,n,GotoIf($["\${AMDSTATUS}" = "MACHINE"]?machine:human)

exten => _X.,n(human),NoOp(Human answered - Playing greeting)
exten => _X.,n,Playback(${campaign.greeting_file_url || "beep"})
exten => _X.,n,Read(digit,,1)
exten => _X.,n,GotoIf($["\${digit}" = "1"]?transfer:hangup)

exten => _X.,n(machine),NoOp(Answering machine detected - Hanging up)
exten => _X.,n,Hangup()

exten => _X.,n(hangup),NoOp(Call ended without transfer)
exten => _X.,n,Hangup()

; Transfer handler using the same GoIP port
exten => transfer,1,NoOp(Transferring call to ${transferNumber || "transfer number"})
exten => transfer,n,Set(TRANSFER_ATTEMPT=1)
exten => transfer,n,Set(TRANSFER_DESTINATION=${transferNumber || ""})
exten => transfer,n,Set(PORT_NUMBER=${campaign.port_number || 1})
exten => transfer,n,Dial(SIP/${transferNumber || ""}@goip_${userId}_port${campaign.port_number || 1},30,g)
exten => transfer,n,NoOp(Transfer result: \${DIALSTATUS})
exten => transfer,n,GotoIf($["\${DIALSTATUS}" = "ANSWER"]?transfer_success:transfer_failed)

exten => transfer,n(transfer_success),NoOp(Transfer successful)
exten => transfer,n,Hangup()

exten => transfer,n(transfer_failed),NoOp(Transfer failed - Playing apology message)
exten => transfer,n,Playback(sorry-cant-connect-call)
exten => transfer,n,Hangup()

exten => h,1,NoOp(Call ended)
exten => h,n,System(curl -X POST "${Deno.env.get("SUPABASE_URL")}/rest/v1/call_logs" \\
    -H "apikey: ${Deno.env.get("SUPABASE_ANON_KEY")}" \\
    -H "Authorization: Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}" \\
    -H "Content-Type: application/json" \\
    -H "Prefer: return=minimal" \\
    -d "{\\"campaign_id\\":\\"${campaignId}\\",\\"status\\":\\"completed\\",\\"phone_number\\":\\"\${CALLERID(num)}\\"}")
`;

    // Return the generated configurations
    return new Response(
      JSON.stringify({
        success: true,
        dialplanConfig,
        agiScript,
        timestamp: new Date().toISOString(),
        transferEnabled: Boolean(transferNumber),
        transferNumber: transferNumber,
        transferNumberName: campaign.transfer_numbers?.name || null,
        portNumber: campaign.port_number || 1
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error generating campaign dialplan:", error);
    return new Response(
      JSON.stringify({ 
        error: String(error),
        message: "Error generating campaign dialplan configuration"
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
