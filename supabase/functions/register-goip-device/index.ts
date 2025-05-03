
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
      const requestText = await req.text();
      console.log("Raw request body:", requestText);
      
      try {
        requestData = JSON.parse(requestText);
      } catch (parseError) {
        console.log("Invalid JSON in request body:", parseError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Invalid request format", 
            error: "Could not parse JSON body",
            details: String(parseError)
          }),
          { status: 400, headers: corsHeaders }
        );
      }

      console.log("Request data:", requestData);
    } catch (error) {
      console.log("Error reading request body:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid request format", 
          error: "Could not read request body",
          details: String(error)
        }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Validate required fields
    const { userId, deviceName, ipAddress, numPorts } = requestData;
    
    if (!userId || !deviceName || !ipAddress) {
      const missingFields = [];
      if (!userId) missingFields.push("userId");
      if (!deviceName) missingFields.push("deviceName");
      if (!ipAddress) missingFields.push("ipAddress");
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing required fields: " + missingFields.join(", "),
          missingFields
        }),
        { status: 400, headers: corsHeaders }
      );
    }
    
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
    
    // Generate SIP credentials for each port
    const ports = [];
    for (let port = 1; port <= numPorts; port++) {
      const username = `goip_${userId.substring(0, 8)}_port${port}`;
      
      // Generate a secure random password (12 characters)
      const randomBytes = new Uint8Array(8);
      crypto.getRandomValues(randomBytes);
      const password = Array.from(randomBytes)
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
        device_ip: ipAddress // Always include device_ip regardless of schema
      });
    }
    
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
      
      console.log("Successfully deleted existing trunks");
    }
    
    console.log(`Inserting ${ports.length} port records for device ${deviceName}`);
    
    // Insert the new ports
    const { data: insertedPorts, error: insertError } = await supabase
      .from('user_trunks')
      .insert(ports)
      .select();
    
    if (insertError) {
      console.error("Error inserting trunks:", insertError);
      
      // Check if this might be due to device_ip column not existing
      if (insertError.message && insertError.message.includes('device_ip')) {
        console.log("Attempting insert without device_ip column");
        
        // Try again without the device_ip field
        const portsWithoutDeviceIp = ports.map(p => {
          const { device_ip, ...rest } = p;
          return rest;
        });
        
        const retryResult = await supabase
          .from('user_trunks')
          .insert(portsWithoutDeviceIp)
          .select();
          
        if (retryResult.error) {
          console.error("Second attempt failed:", retryResult.error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: `Error registering device: ${insertError.message}. Second attempt also failed: ${retryResult.error.message}`,
              errorType: "database" 
            }),
            { headers: corsHeaders }
          );
        }
        
        console.log("Successfully inserted trunks without device_ip field");
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "GoIP device registered successfully (without device IP)",
            deviceName,
            numPorts,
            ports: retryResult.data || []
          }),
          { headers: corsHeaders }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error registering device: ${insertError.message}`,
          errorType: "database" 
        }),
        { headers: corsHeaders }
      );
    }
    
    console.log("Successfully inserted all port records");
    
    // Store configuration in the database for Asterisk
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
    
    try {
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
        console.error("Error storing SIP configuration:", configError);
        // Don't fail the request if this fails, just log it
      } else {
        console.log("Stored SIP configuration in database");
      }
    } catch (configError) {
      console.error("Error storing configuration:", configError);
      // Don't fail if this fails
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "GoIP device registered successfully",
        deviceName,
        numPorts,
        ports: insertedPorts || []
      }),
      { headers: corsHeaders }
    );
    
  } catch (error) {
    console.error("Unhandled error in GoIP device registration:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: "An unexpected error occurred while registering your GoIP device",
        error: error instanceof Error ? error.message : String(error),
        errorType: "unhandled_error"
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
