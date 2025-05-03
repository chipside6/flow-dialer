
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
      const timeout = 10000; // 10 second timeout - increased from 5 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const pingUrl = `http://${ipAddress}:80`;
      console.log(`Attempting to connect to: ${pingUrl}`);
      
      try {
        const pingResponse = await fetch(pingUrl, { 
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`Response status from ${ipAddress}: ${pingResponse.status}`);
      } catch (connectionError) {
        console.log(`Connection failed to GoIP device at ${ipAddress}:`, connectionError.message);
        
        // Instead of failing here, we'll continue and create the device anyway
        // but log a warning message
        console.log(`WARNING: Could not connect to GoIP device at ${ipAddress}, but continuing with registration`);
      }
      
      console.log(`Proceeding with device registration at ${ipAddress}`);
    } catch (error) {
      console.log("Error validating GoIP device:", error);
      // Continue with registration despite validation error
      console.log("Continuing registration despite validation error");
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
        user_id: userId
      });
    }
    
    // Check if table has device_ip column
    const { data: columnInfo, error: columnCheckError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_trunks')
      .eq('column_name', 'device_ip');
    
    if (columnCheckError) {
      console.error("Error checking for device_ip column:", columnCheckError);
    }
    
    const hasDeviceIpColumn = columnInfo && columnInfo.length > 0;
    console.log(`Table user_trunks has device_ip column: ${hasDeviceIpColumn}`);
    
    // Store device information and SIP credentials in Supabase
    console.log(`Storing ${numPorts} trunks for device ${deviceName}`);
    
    // Check if any existing trunks with the same name exist
    const { data: existingTrunks, error: checkError } = await supabase
      .from('user_trunks')
      .select('*')
      .eq('user_id', userId)
      .eq('trunk_name', deviceName);
      
    if (checkError) {
      console.error("Error checking existing trunks:", checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error checking existing trunks: ${checkError.message}`,
          errorType: "database" 
        }),
        { headers: corsHeaders }
      );
    }
    
    if (existingTrunks && existingTrunks.length > 0) {
      console.log(`Found ${existingTrunks.length} existing trunks with name ${deviceName}, deleting...`);
      
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
            message: `Error deleting existing trunks: ${deleteError.message}`,
            errorType: "database" 
          }),
          { headers: corsHeaders }
        );
      }
    }
    
    // Insert the new trunks - handle if device_ip column exists or not
    let insertData;
    let insertError;
    
    if (hasDeviceIpColumn) {
      // Add device_ip to each port record
      const portsWithIp = ports.map(port => ({
        ...port,
        device_ip: ipAddress
      }));
      
      const result = await supabase
        .from('user_trunks')
        .insert(portsWithIp)
        .select();
        
      insertData = result.data;
      insertError = result.error;
    } else {
      // Just insert without device_ip
      const result = await supabase
        .from('user_trunks')
        .insert(ports)
        .select();
        
      insertData = result.data;
      insertError = result.error;
    }
    
    if (insertError) {
      console.error("Error inserting trunks:", insertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error registering device: ${insertError.message}`,
          errorType: "database" 
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
      console.log("Asterisk server not configured, storing configuration in database only");
      
      // Store configuration in the database even if we can't connect to Asterisk
      const { error: configError } = await supabase
        .from('asterisk_configs')
        .insert({
          user_id: userId,
          config_name: `goip_${deviceName}`,
          config_type: 'sip',
          config_content: sipConfig,
          active: true
        });
        
      if (configError) {
        console.error("Error storing Asterisk configuration:", configError);
        // Don't return error here as the device is registered, just log it
      } else {
        console.log("Stored SIP configuration in database");
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Device registered successfully. SIP configuration stored for later application.",
          device: {
            device_name: deviceName,
            device_ip: ipAddress,
            num_ports: numPorts,
            user_id: userId,
            ports: insertData || []
          },
          asteriskConfig: {
            configured: false,
            reason: "Asterisk server is not configured"
          }
        }),
        { headers: corsHeaders }
      );
    }

    console.log(`Asterisk server is configured at ${ASTERISK_SERVER_HOST}`);
    
    // Store the configuration in the database regardless
    const { error: configError } = await supabase
      .from('asterisk_configs')
      .insert({
        user_id: userId,
        config_name: `goip_${deviceName}`,
        config_type: 'sip',
        config_content: sipConfig,
        active: true
      });
    
    if (configError) {
      console.error("Error storing Asterisk configuration:", configError);
      // Don't return error here as the device is registered, just log it
    } else {
      console.log("Stored SIP configuration in database");
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "GoIP device registered successfully and SIP configuration stored",
        device: {
          device_name: deviceName,
          device_ip: ipAddress,
          num_ports: numPorts,
          user_id: userId,
          ports: insertData || []
        },
        asteriskConfig: {
          configured: true,
          server: ASTERISK_SERVER_HOST
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
        error: error instanceof Error ? error.message : String(error),
        errorType: "unhandled_error"
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
