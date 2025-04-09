
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoipIntegrationRequest {
  userId: string;
  action: 'reload' | 'check_status' | 'get_config';
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

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process the request based on the method
    if (req.method === "POST") {
      const requestData: GoipIntegrationRequest = await req.json();
      const { userId, action } = requestData;
      
      // Verify the user has permission
      if (userId !== user.id) {
        return new Response(
          JSON.stringify({ error: "You don't have permission to access this resource" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get the user's GoIP credentials
      const { data: credentials, error: credentialsError } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', userId);
        
      if (credentialsError) {
        return new Response(
          JSON.stringify({ error: "Error fetching user credentials" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!credentials || credentials.length === 0) {
        return new Response(
          JSON.stringify({ error: "No GoIP credentials found for this user" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      switch (action) {
        case 'reload':
          // Simulate reloading Asterisk configuration
          console.log(`Reloading Asterisk configuration for user ${userId}`);
          
          // In a real implementation, this would connect to your Asterisk server via API
          // and reload the SIP configuration
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Asterisk configuration reloaded successfully",
              timestamp: new Date().toISOString()
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
          
        case 'check_status':
          // Simulate checking GoIP device status
          const statusResults = credentials.map(cred => ({
            port: cred.port_number,
            status: Math.random() > 0.3 ? 'registered' : 'unreachable', // Simulate random status
            lastSeen: new Date().toISOString(),
            username: cred.sip_user
          }));
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              statuses: statusResults,
              timestamp: new Date().toISOString()
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
          
        case 'get_config':
          // Generate Asterisk configuration for the user
          const sipConfig = credentials.map(cred => `
[goip_${cred.sip_user}]
type=peer
host=dynamic
port=5060
username=${cred.sip_user}
secret=${cred.sip_pass}
fromuser=${cred.sip_user}
context=from-goip
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no
rtp_timeout=30
transport=udp
          `.trim()).join('\n\n');
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              config: {
                sip: sipConfig,
              }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
          
        default:
          return new Response(
            JSON.stringify({ error: "Invalid action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
      }
    }
    
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in GoIP Asterisk integration:", error);
    
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
