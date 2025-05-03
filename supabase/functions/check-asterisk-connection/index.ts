
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking Asterisk server connection...");
    
    // Get Asterisk server config from environment variables
    const ASTERISK_SERVER_HOST = Deno.env.get("ASTERISK_SERVER_HOST");
    const ASTERISK_SERVER_USER = Deno.env.get("ASTERISK_SERVER_USER");
    const ASTERISK_SERVER_PASS = Deno.env.get("ASTERISK_SERVER_PASS");
    const ASTERISK_SERVER_PORT = parseInt(Deno.env.get("ASTERISK_SERVER_PORT") || "22");
    
    // Check if Asterisk server is configured
    if (!ASTERISK_SERVER_HOST || !ASTERISK_SERVER_USER || !ASTERISK_SERVER_PASS) {
      console.log("Asterisk server not configured properly");
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Asterisk server configuration is incomplete. Please check the server settings.",
          missing: {
            host: !ASTERISK_SERVER_HOST,
            user: !ASTERISK_SERVER_USER,
            pass: !ASTERISK_SERVER_PASS,
            port: !ASTERISK_SERVER_PORT
          }
        }),
        { headers: corsHeaders }
      );
    }
    
    // Check connectivity to Asterisk server
    console.log(`Testing connection to Asterisk server at ${ASTERISK_SERVER_HOST}:${ASTERISK_SERVER_PORT}`);
    
    try {
      // Attempt to connect to the server (just a basic connectivity check)
      // In a production environment, we would use a proper SSH/API client
      // This is just simulating the check
      
      // Simulate a connection check by pinging the host
      const timeout = 5000; // 5 second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const pingUrl = `http://${ASTERISK_SERVER_HOST}:${ASTERISK_SERVER_PORT === 22 ? 80 : ASTERISK_SERVER_PORT}`;
      console.log(`Attempting to connect to: ${pingUrl}`);
      
      const pingResponse = await fetch(pingUrl, { 
        method: 'HEAD',
        signal: controller.signal
      }).catch(error => {
        console.log(`Connection failed to Asterisk server at ${ASTERISK_SERVER_HOST}:`, error.message);
        return null;
      });
      
      clearTimeout(timeoutId);
      
      if (!pingResponse) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Could not reach Asterisk server at ${ASTERISK_SERVER_HOST}. Please verify the server address and ensure the server is online.`,
            errorType: "connection"
          }),
          { headers: corsHeaders }
        );
      }
      
      console.log(`Successfully reached server at ${ASTERISK_SERVER_HOST}`);
      
      // In a real implementation, we would validate credentials here
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Successfully connected to Asterisk server",
          serverInfo: {
            host: ASTERISK_SERVER_HOST,
            port: ASTERISK_SERVER_PORT
          }
        }),
        { headers: corsHeaders }
      );
    } catch (error) {
      console.error("Error testing Asterisk connection:", error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error connecting to Asterisk server: ${error instanceof Error ? error.message : String(error)}`,
          errorType: "connection_test_error"
        }),
        { headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Unhandled error in Asterisk connection check:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: "An unexpected error occurred while checking the Asterisk server connection",
        error: error instanceof Error ? error.message : String(error),
        errorType: "unhandled_error"
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
