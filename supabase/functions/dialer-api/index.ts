
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
  maxConcurrentCalls?: number; // This will always be 1 regardless of what's passed
  portNumber?: number; // Added port number
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
        const { campaignId, phoneNumber, transferNumber, greetingFileUrl, portNumber = 1 } = requestData;
        
        // Always use 1 for maxConcurrentCalls regardless of what was passed
        const maxConcurrentCalls = 1;
        
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

        // In a real implementation, this would connect to your actual dialer service
        // But for now, we'll simulate a call
        console.log(`Simulating call to ${phoneNumber} for campaign ${campaignId}`);
        console.log(`Transfer number: ${transferNumber}`);
        console.log(`Max concurrent calls: ${maxConcurrentCalls}`);
        console.log(`Using GoIP port: ${portNumber}`);
        if (greetingFileUrl) {
          console.log(`Greeting file: ${greetingFileUrl}`);
        }

        // Update the campaign statistics (this is just a simulation)
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

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Call initiated",
            callId: crypto.randomUUID(),
            maxConcurrentCalls,
            portNumber,
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

        return new Response(
          JSON.stringify({ 
            success: true, 
            campaign,
            maxConcurrentCalls: 1 // Always return 1 as the fixed value
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
