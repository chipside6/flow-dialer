
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
    // Define a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timed out after 15 seconds")), 15000);
    });

    // Parse the request body
    const requestData = await req.json().catch(err => {
      console.error("Error parsing request body:", err);
      return {};
    });

    // Get server details from request or use defaults
    const serverIp = requestData.serverIp || Deno.env.get("ASTERISK_SERVER_HOST") || "192.168.0.197";
    const username = requestData.username || Deno.env.get("ASTERISK_SERVER_USER") || "admin";
    const password = requestData.password || Deno.env.get("ASTERISK_SERVER_PASS") || "admin";
    const port = requestData.port || Deno.env.get("ASTERISK_SERVER_PORT") || "8088";

    console.log(`Testing connection to Asterisk server at ${serverIp}:${port}`);

    // Create the auth header (Base64 encoded username:password)
    const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
    
    // Construct the URL - fix: use the correct server IP and port
    const url = `http://${serverIp}:${port}/ari/applications`;

    try {
      // Make the request with a timeout
      const response = await Promise.race([
        fetch(url, {
          method: "GET",
          headers: {
            "Authorization": authHeader
          }
        }),
        timeoutPromise
      ]) as Response;

      console.log(`Received response with status: ${response.status}`);

      // Handle different response status codes
      if (response.status === 200) {
        const data = await response.json();
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Connected to Asterisk successfully",
            details: `Server responded with ${data.length} application(s)` 
          }),
          { headers: corsHeaders }
        );
      } else if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Authentication failed: Invalid username or password",
            details: "Check your Asterisk server credentials" 
          }),
          { headers: corsHeaders }
        );
      } else if (response.status === 404) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Server found, but API endpoint not available",
            details: "Make sure Asterisk REST Interface (ARI) is enabled and configured properly" 
          }),
          { headers: corsHeaders }
        );
      } else {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = "Could not extract response text";
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Unexpected response: ${response.status} ${response.statusText}`,
            details: errorText 
          }),
          { headers: corsHeaders }
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      
      let errorMessage = error instanceof Error ? error.message : String(error);
      let details = "Check your network connection and server configuration";
      
      if (errorMessage.includes("timed out")) {
        details = "The server didn't respond within the timeout period. It may be offline or unreachable.";
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Connection error: ${errorMessage}`,
          details: details
        }),
        { headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Server error: ${error instanceof Error ? error.message : String(error)}`,
        details: "An unexpected error occurred on the server" 
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
