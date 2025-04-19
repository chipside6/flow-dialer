
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, campaignId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing userId parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating dialplan for user ${userId}`);

    // Get user information
    const { data: userProfile, error: userError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch user profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get specific campaign if campaignId is provided
    let campaign = null;
    if (campaignId) {
      const { data: campaignData, error: campaignError } = await supabaseClient
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('user_id', userId)
        .single();

      if (campaignError) {
        console.error('Error fetching campaign:', campaignError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch campaign' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      campaign = campaignData;
    }

    // Generate the dialplan
    let dialplan = `;Dialplan configuration for user ${userId}\n`;
    dialplan += `;Generated at ${new Date().toISOString()}\n\n`;

    // Base context for incoming calls
    dialplan += `[from-goip]\n`;
    dialplan += `exten => _X.,1,NoOp(Incoming call from GoIP device)\n`;
    dialplan += `exten => _X.,n,Set(CALLERID(name)=\${CALLERID(num)})\n`;
    dialplan += `exten => _X.,n,Goto(autodialer,s,1)\n\n`;

    // Main autodialer context
    dialplan += `[autodialer]\n`;
    dialplan += `exten => s,1,NoOp(Autodialer call started)\n`;
    dialplan += `exten => s,n,Answer()\n`;
    dialplan += `exten => s,n,Wait(1)\n`;
    
    // AMD (Answering Machine Detection)
    dialplan += `exten => s,n,AMD()\n`;
    dialplan += `exten => s,n,GotoIf($["${AMDSTATUS}" != "HUMAN"]?hangup)\n`;
    
    // Play greeting
    if (campaign && campaign.greeting_file_url) {
      dialplan += `exten => s,n,Playback(${campaign.id}_greeting)\n`;
    } else {
      dialplan += `exten => s,n,Playback(generic_greeting)\n`;
    }
    
    // Handle DTMF for transfer
    dialplan += `exten => s,n,Set(TIMEOUT(digit)=5)\n`;
    dialplan += `exten => s,n,Set(TIMEOUT(response)=10)\n`;
    dialplan += `exten => s,n,WaitExten(5)\n`;
    dialplan += `exten => s,n,Hangup()\n\n`;
    
    // Transfer handling
    const transferNumber = campaign ? campaign.transfer_number : '1000';
    dialplan += `; Handle key press 1 for transfer\n`;
    dialplan += `exten => 1,1,NoOp(Transferring call)\n`;
    dialplan += `exten => 1,n,Set(TRANSFER_REQUESTED=1)\n`;
    dialplan += `exten => 1,n,Dial(SIP/${transferNumber},30,g)\n`;
    dialplan += `exten => 1,n,Hangup()\n\n`;
    
    // Hangup handling
    dialplan += `; Handle hangup\n`;
    dialplan += `exten => h,1,NoOp(Call ended)\n`;
    dialplan += `exten => h,n,AGI(end_call.agi,${userId},${campaignId || 'null'},${transferNumber})\n\n`;
    
    // Label for AMD non-human result
    dialplan += `exten => s(hangup),1,NoOp(AMD determined non-human or error)\n`;
    dialplan += `exten => s(hangup),n,Hangup()\n`;

    // Generate AGI script for call ending
    const agiScript = `#!/usr/bin/env python3
import sys
import os
import requests
import json
from asterisk.agi import AGI

# Initialize AGI
agi = AGI()
agi.verbose("Call ending AGI script started")

# Get parameters
user_id = sys.argv[1] if len(sys.argv) > 1 else "unknown"
campaign_id = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != "null" else None
transfer_number = sys.argv[3] if len(sys.argv) > 3 else "unknown"

# Get call details
caller_id = agi.env['agi_callerid']
duration = agi.get_variable("ANSWEREDTIME")
status = "answered"
transfer_requested = agi.get_variable("TRANSFER_REQUESTED") or "0"
transfer_successful = agi.get_variable("DIALSTATUS") == "ANSWER" and transfer_requested == "1"

# Prepare API call
api_url = "${Deno.env.get('SUPABASE_URL')}/functions/v1/end-call"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}"
}
payload = {
    "userId": user_id,
    "portNumber": 1,  # Default port, will be updated by Asterisk
    "campaignId": campaign_id,
    "callStatus": status,
    "duration": duration,
    "phoneNumber": caller_id,
    "transferRequested": transfer_requested == "1",
    "transferSuccessful": transfer_successful
}

try:
    response = requests.post(api_url, headers=headers, data=json.dumps(payload))
    agi.verbose(f"API response: {response.status_code}")
    if response.status_code != 200:
        agi.verbose(f"API error: {response.text}")
except Exception as e:
    agi.verbose(f"Error calling API: {str(e)}")

agi.verbose("Call ending AGI script completed")
sys.exit(0)
`;

    // Store the dialplan in the database
    const { error: dialplanError } = await supabaseClient
      .from('asterisk_configs')
      .upsert({
        user_id: userId,
        config_type: 'dialplan',
        config_name: 'extensions.conf',
        config_content: dialplan,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,config_type' });

    if (dialplanError) {
      console.error('Error storing dialplan:', dialplanError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to store dialplan configuration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Store the AGI script in the database
    const { error: agiError } = await supabaseClient
      .from('asterisk_configs')
      .upsert({
        user_id: userId,
        config_type: 'agi',
        config_name: 'end_call.agi',
        config_content: agiScript,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,config_type' });

    if (agiError) {
      console.error('Error storing AGI script:', agiError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to store AGI script' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Return the generated dialplan and AGI script
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dialplan and AGI script generated successfully',
        dialplan: dialplan,
        agiScript: agiScript
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating dialplan:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
