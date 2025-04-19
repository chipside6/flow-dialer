
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

    const { campaignId, userId } = await req.json();

    if (!campaignId || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Starting campaign ${campaignId} for user ${userId}`);

    // 1. Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign error:', campaignError);
      return new Response(
        JSON.stringify({ success: false, error: campaignError?.message || 'Campaign not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // 2. Find available port
    const { data: availablePorts, error: portsError } = await supabaseClient
      .from('user_trunks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('port_number', { ascending: true });

    if (portsError || !availablePorts || availablePorts.length === 0) {
      console.error('Ports error:', portsError);
      return new Response(
        JSON.stringify({ success: false, error: 'No available ports found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Select the first available port
    const selectedPort = availablePorts[0];

    // 3. Mark port as busy
    const { error: updateError } = await supabaseClient
      .from('user_trunks')
      .update({
        status: 'busy',
        updated_at: new Date().toISOString(),
        current_campaign_id: campaignId
      })
      .eq('id', selectedPort.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to allocate port' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 4. Return the port information for the call
    return new Response(
      JSON.stringify({
        success: true,
        portNumber: selectedPort.port_number,
        sipUser: selectedPort.sip_user,
        portId: selectedPort.id,
        message: `Campaign ${campaignId} started with port ${selectedPort.port_number}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error starting campaign:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
