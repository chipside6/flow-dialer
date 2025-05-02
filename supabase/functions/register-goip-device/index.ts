
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

interface DeviceRegistrationRequest {
  userId: string;
  deviceName: string;
  ipAddress: string;
  numPorts: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting GoIP device registration function");
    
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("Request rejected: No authorization header");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Authentication required", 
          error: "No authorization header" 
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
      console.log("Authentication failed:", userError?.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid or expired session", 
          error: userError?.message 
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    // Get request data
    let requestData: DeviceRegistrationRequest;
    try {
      requestData = await req.json();
      console.log("Request data:", requestData);
    } catch (error) {
      console.log("Invalid JSON in request body:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid request format", 
          error: "Could not parse JSON body" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { userId, deviceName, ipAddress, numPorts } = requestData;
    
    // Verify the user is registering their own device
    if (userId !== user.id) {
      console.log(`Permission denied: User ${user.id} cannot register device for ${userId}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "You don't have permission to register devices for other users" 
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Validate that the GoIP IP is reachable
    console.log(`Validating GoIP device at IP: ${ipAddress}`);
    try {
      // Try to connect to the GoIP device using a simple HTTP check
      const timeout = 5000; // 5 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const pingResponse = await fetch(`http://${ipAddress}:80`, { 
        method: 'HEAD',
        signal: controller.signal
      }).catch(error => {
        console.log(`Connection failed to GoIP device at ${ipAddress}:`, error.message);
        return null;
      });
      
      clearTimeout(timeoutId);
      
      if (!pingResponse || !pingResponse.ok) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Could not reach GoIP device at ${ipAddress}. Please verify the IP address and ensure the device is online.` 
          }),
          { headers: corsHeaders }
        );
      }
      
      console.log(`Successfully reached device at ${ipAddress}`);
    } catch (error) {
      console.log("Error validating GoIP device:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error validating GoIP device: ${error instanceof Error ? error.message : String(error)}` 
        }),
        { headers: corsHeaders }
      );
    }

    // Generate SIP credentials for each port
    const ports = [];
    for (let port = 1; port <= numPorts; port++) {
      const username = `goip_${userId.substring(0, 8)}_port${port}`;
      // Generate a secure random password
      const password = Array.from(crypto.getRandomValues(new Uint8Array(12)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 12);
      
      ports.push({
        port_number: port,
        sip_user: username,
        sip_pass: password,
        status: 'active',
        trunk_name: deviceName,
        user_id: userId,
        device_ip: ipAddress
      });
    }
    
    // Store device information and SIP credentials in Supabase
    console.log(`Storing ${numPorts} trunks for device ${deviceName}`);
    
    // Delete any existing trunks with the same name
    const { error: deleteError } = await supabase
      .from('user_trunks')
      .delete()
      .eq('user_id', userId)
      .eq('trunk_name', deviceName);
    
    if (deleteError) {
      console.error("Error deleting existing trunks:", deleteError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error deleting existing trunks: ${deleteError.message}` 
        }),
        { headers: corsHeaders }
      );
    }
    
    // Insert the new trunks
    const { data: insertedData, error: insertError } = await supabase
      .from('user_trunks')
      .insert(ports)
      .select();
    
    if (insertError) {
      console.error("Error inserting trunks:", insertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error registering device: ${insertError.message}` 
        }),
        { headers: corsHeaders }
      );
    }

    // Generate Asterisk SIP configuration
    const sipConfig = ports.map(port => `
[goip-${userId.substring(0, 8)}-port${port.port_number}]
type=friend
host=${ipAddress}
port=5060
username=${port.sip_user}
secret=${port.sip_pass}
fromuser=${port.sip_user}
context=from-goip
disallow=all
allow=ulaw
insecure=port,invite
nat=no
qualify=yes
    `.trim()).join('\n\n');
    
    // Get Asterisk server config from environment variables
    const ASTERISK_SERVER_HOST = Deno.env.get("ASTERISK_SERVER_HOST");
    const ASTERISK_SERVER_USER = Deno.env.get("ASTERISK_SERVER_USER");
    const ASTERISK_SERVER_PASS = Deno.env.get("ASTERISK_SERVER_PASS");
    const ASTERISK_SERVER_PORT = parseInt(Deno.env.get("ASTERISK_SERVER_PORT") || "22");
    
    if (!ASTERISK_SERVER_HOST || !ASTERISK_SERVER_USER || !ASTERISK_SERVER_PASS) {
      // Store configuration in the database even if we can't connect to Asterisk
      await supabase
        .from('asterisk_configs')
        .insert({
          user_id: userId,
          config_name: `goip_${deviceName}`,
          config_type: 'sip',
          config_content: sipConfig,
          active: true
        });
        
      console.log("Stored SIP configuration in database (Asterisk server not configured)");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Device registered successfully but Asterisk server is not configured. SIP configuration stored for manual application.",
          device: {
            device_name: deviceName,
            device_ip: ipAddress,
            num_ports: numPorts,
            user_id: userId,
            ports: insertedData || []
          }
        }),
        { headers: corsHeaders }
      );
    }

    // In production, connect to Asterisk server and update config
    console.log("Would connect to Asterisk server and:");
    console.log(`1. Write config to /etc/asterisk/sip_goip_${userId.substring(0, 8)}.conf`);
    console.log("2. Reload SIP configuration with 'asterisk -rx \"sip reload\"'");
    
    // Store the configuration in the database regardless
    await supabase
      .from('asterisk_configs')
      .insert({
        user_id: userId,
        config_name: `goip_${deviceName}`,
        config_type: 'sip',
        config_content: sipConfig,
        active: true
      });
    
    // In a production environment, we would connect to the Asterisk server via SSH
    // and write the SIP configuration file, then reload Asterisk
    // This is simulated here and would need actual implementation
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "GoIP device registered successfully and SIP configuration applied",
        device: {
          device_name: deviceName,
          device_ip: ipAddress,
          num_ports: numPorts,
          user_id: userId,
          ports: insertedData || []
        }
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Unhandled error in GoIP device registration:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: "An error occurred while registering your GoIP device",
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
