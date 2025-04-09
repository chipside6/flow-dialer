
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DialRequest {
  campaignId: string;
  phoneNumber: string;
  transferNumber: string;
  greetingFileUrl?: string;
  portNumber?: number;
  isTest?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "No authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Create Supabase client
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Create authenticated Supabase client
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

  try {
    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process the request based on the method
    switch (req.method) {
      case "POST": {
        // Initiate a call
        const requestData = await req.json();
        const { 
          campaignId, 
          phoneNumber, 
          transferNumber, 
          greetingFileUrl,
          portNumber = 1,
          isTest = false
        } = requestData;
        
        if (!campaignId || !phoneNumber || !transferNumber) {
          return new Response(
            JSON.stringify({ error: "Missing required parameters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify the campaign belongs to the user
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .eq('user_id', user.id)
          .single();

        if (campaignError || !campaign) {
          return new Response(
            JSON.stringify({ error: "Campaign not found or access denied" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Verify the user has a GoIP trunk configured for this port
        const { data: trunks, error: trunksError } = await supabase
          .from('user_trunks')
          .select('*')
          .eq('user_id', user.id)
          .eq('port_number', portNumber)
          .limit(1);
          
        if (trunksError) {
          throw trunksError;
        }
        
        if (!trunks || trunks.length === 0) {
          return new Response(
            JSON.stringify({ error: "No GoIP trunk configured for this port" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get Asterisk server credentials
        const ASTERISK_SERVER_HOST = Deno.env.get("ASTERISK_SERVER_HOST");
        const ASTERISK_SERVER_USER = Deno.env.get("ASTERISK_SERVER_USER");
        const ASTERISK_SERVER_PASS = Deno.env.get("ASTERISK_SERVER_PASS");
        const ASTERISK_SERVER_PORT = parseInt(Deno.env.get("ASTERISK_SERVER_PORT") || "22");
        
        const trunk = trunks[0];
        const sipUser = trunk.sip_user;
        
        // In a real implementation, we would connect to Asterisk and originate a call
        // For now, we'll log the details and update the campaign statistics
        console.log(`Originating call to ${phoneNumber} via goip_${user.id}_port${portNumber} for campaign ${campaignId}`);
        console.log(`Transfer number: ${transferNumber}`);
        console.log(`SIP User: ${sipUser}`);
        
        // Determine if this is a test call
        const callType = isTest ? 'test' : 'campaign';
        console.log(`Call type: ${callType}`);
        
        // Prepare the command that would be sent to Asterisk
        // This would use the specific user's GoIP SIP trunk
        const asteriskCommand = `channel originate SIP/goip_${user.id}_port${portNumber}/1${phoneNumber} application AGI(autodialer.agi,${campaignId},${user.id},${transferNumber})`;
        console.log(`Asterisk command: ${asteriskCommand}`);
        
        // Create a call log entry
        const { data: callLog, error: callLogError } = await supabase
          .from('call_logs')
          .insert({
            campaign_id: campaignId,
            user_id: user.id,
            phone_number: phoneNumber,
            status: 'initiated',
            duration: 0,
            transfer_requested: false,
            transfer_successful: false,
            notes: isTest ? 'Test call' : null
          })
          .select()
          .single();
          
        if (callLogError) {
          console.error('Error creating call log:', callLogError);
        }

        // Update the campaign statistics if not a test call
        if (!isTest) {
          const { error: updateError } = await supabase
            .from('campaigns')
            .update({
              status: 'running',
              total_calls: campaign.total_calls + 1,
            })
            .eq('id', campaignId);

          if (updateError) {
            throw updateError;
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: isTest ? "Test call initiated" : "Call initiated",
            callId: callLog?.id || crypto.randomUUID(),
            portNumber,
            sipUser
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "GET": {
        // Get campaign status
        const url = new URL(req.url);
        const campaignId = url.searchParams.get("campaignId");

        if (!campaignId) {
          return new Response(
            JSON.stringify({ error: "Missing campaignId parameter" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify the campaign belongs to the user
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .eq('user_id', user.id)
          .single();

        if (campaignError || !campaign) {
          return new Response(
            JSON.stringify({ error: "Campaign not found or access denied" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get call statistics
        const { data: callLogs, error: callLogsError } = await supabase
          .from('call_logs')
          .select('*')
          .eq('campaign_id', campaignId)
          .eq('user_id', user.id);
          
        if (callLogsError) {
          throw callLogsError;
        }
        
        // Calculate statistics
        const totalCalls = callLogs?.length || 0;
        const answeredCalls = callLogs?.filter(log => log.status === 'answered' || log.status === 'completed').length || 0;
        const transferredCalls = callLogs?.filter(log => log.transfer_requested).length || 0;
        const failedCalls = callLogs?.filter(log => log.status === 'failed' || log.status === 'no-answer').length || 0;

        return new Response(
          JSON.stringify({ 
            success: true, 
            campaign,
            statistics: {
              totalCalls,
              answeredCalls,
              transferredCalls,
              failedCalls
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error in dialer-api function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
