
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const asteriskHost = Deno.env.get('ASTERISK_SERVER_HOST') || '';
const asteriskUser = Deno.env.get('ASTERISK_SERVER_USER') || '';
const asteriskPass = Deno.env.get('ASTERISK_SERVER_PASS') || '';
const asteriskPort = Deno.env.get('ASTERISK_SERVER_PORT') || '5038';

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, callId, portId } = await req.json();

    if (!campaignId || !callId || !portId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: campaignId, callId, or portId' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing transfer request for campaign ${campaignId}, call ${callId}, port ${portId}`);

    // 1. Get the campaign details to find the transfer number
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Error fetching campaign:', campaignError);
      return new Response(
        JSON.stringify({ success: false, error: 'Campaign not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Make sure we have a transfer number
    const transferNumber = campaign.transfer_number;
    if (!transferNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'No transfer number configured for this campaign' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Get the port information
    const { data: port, error: portError } = await supabase
      .from('goip_ports')
      .select('*, goip_devices(*)')
      .eq('id', portId)
      .single();

    if (portError || !port) {
      console.error('Error fetching port:', portError);
      return new Response(
        JSON.stringify({ success: false, error: 'Port not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Connect to Asterisk AMI and execute the transfer
    try {
      // Construct a basic AMI call to initiate the transfer
      const amiResponse = await fetch(`http://${asteriskHost}:${asteriskPort}/ari/channels/${callId}/redirect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${asteriskUser}:${asteriskPass}`)}`
        },
        body: JSON.stringify({
          endpoint: `SIP/${transferNumber}@goip-${portId}`,
          context: 'from-internal',
          priority: 1
        })
      });

      if (!amiResponse.ok) {
        const errorText = await amiResponse.text();
        throw new Error(`AMI error: ${errorText}`);
      }

      // 5. Record the transfer in active_calls
      await supabase
        .from('active_calls')
        .update({ 
          status: 'transferred',
          transfer_number_id: transferNumber 
        })
        .eq('campaign_id', campaignId)
        .eq('port_id', portId);

      return new Response(
        JSON.stringify({ success: true, message: 'Transfer initiated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error initiating transfer:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
