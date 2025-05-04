
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

    // Extract JWT token from Authorization header
    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.log("Authentication error:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Authentication failed", 
          error: authError?.message || "Invalid authentication token" 
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
            error: "Could not parse JSON body"
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
          error: "Could not read request body" 
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
        device_ip: ipAddress
      });
    }
    
    // Check if any existing trunks with the same name exist
    let { data: existingTrunks, error: checkError } = await supabaseAdmin
      .from('user_trunks')
      .select('*')
      .eq('user_id', userId)
      .eq('trunk_name', deviceName);
      
    if (checkError) {
      console.error("Error checking existing trunks:", checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Database error: ${checkError.message}`,
          errorType: "database" 
        }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    if (existingTrunks && existingTrunks.length > 0) {
      console.log(`Found ${existingTrunks.length} existing trunks with name ${deviceName}, deleting...`);
      
      // Delete any existing trunks with the same name
      const { error: deleteError } = await supabaseAdmin
        .from('user_trunks')
        .delete()
        .eq('user_id', userId)
        .eq('trunk_name', deviceName);
      
      if (deleteError) {
        console.error("Error deleting existing trunks:", deleteError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Database error: ${deleteError.message}`,
            errorType: "database" 
          }),
          { headers: corsHeaders, status: 500 }
        );
      }
      
      console.log("Successfully deleted existing trunks");
    }
    
    console.log(`Inserting ${ports.length} port records for device ${deviceName}`);
    
    // Check if device_ip column exists in user_trunks table
    const { error: columnCheckError, data: columnCheckData } = await supabaseAdmin.rpc('column_exists', {
      'table_name': 'user_trunks',
      'column_name': 'device_ip'
    });
    
    if (columnCheckError) {
      console.error("Error checking for device_ip column:", columnCheckError);
    }
    
    let insertData = [];
    if (columnCheckData === true) {
      // If device_ip column exists, include it
      insertData = ports;
    } else {
      // If device_ip column doesn't exist, remove it from the insert data
      insertData = ports.map(port => {
        const { device_ip, ...rest } = port;
        return rest;
      });
    }
    
    const { data: insertedPorts, error: insertError } = await supabaseAdmin
      .from('user_trunks')
      .insert(insertData)
      .select();
    
    if (insertError) {
      console.error("Error inserting trunks:", insertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Database error: Unable to register device",
          error: insertError.message
        }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    console.log("Successfully inserted all port records");
    
    // Success response
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
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
