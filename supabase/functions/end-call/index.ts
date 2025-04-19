
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

    const { 
      userId, 
      portNumber, 
      campaignId, 
      callStatus, 
      duration, 
      phoneNumber, 
      transferRequested, 
      transferSuccessful,
      notes
    } = await req.json();

    if (!userId || !portNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Ending call for user ${userId}, port ${portNumber}`);

    // 1. Log the call in call_logs table
    if (campaignId) {
      const { error: logError } = await supabaseClient
        .from('call_logs')
        .insert({
          user_id: userId,
          campaign_id: campaignId,
          phone_number: phoneNumber || 'unknown',
          status: callStatus || 'completed',
          duration: duration || 0,
          transfer_requested: transferRequested || false,
          transfer_successful: transferSuccessful || false,
          notes: notes || null
        });

      if (logError) {
        console.error('Error logging call:', logError);
        // Continue even if logging fails
      }

      // 2. Update campaign stats if available
      const campaignUpdateData: any = {};
      
      if (callStatus === 'answered') {
        campaignUpdateData.answered_calls = supabaseClient.rpc('increment', { row_id: campaignId, table_name: 'campaigns', column_name: 'answered_calls', amount: 1 });
      }
      
      if (transferSuccessful) {
        campaignUpdateData.transferred_calls = supabaseClient.rpc('increment', { row_id: campaignId, table_name: 'campaigns', column_name: 'transferred_calls', amount: 1 });
      }
      
      if (callStatus === 'failed') {
        campaignUpdateData.failed_calls = supabaseClient.rpc('increment', { row_id: campaignId, table_name: 'campaigns', column_name: 'failed_calls', amount: 1 });
      }
      
      if (Object.keys(campaignUpdateData).length > 0) {
        await supabaseClient
          .from('campaigns')
          .update(campaignUpdateData)
          .eq('id', campaignId);
      }
    }

    // 3. Mark port as available
    const { error: updateError } = await supabaseClient
      .from('user_trunks')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
        current_campaign_id: null,
        current_call_id: null
      })
      .eq('user_id', userId)
      .eq('port_number', portNumber);

    if (updateError) {
      console.error('Error releasing port:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to release port' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Call ended and port ${portNumber} released successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error ending call:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
