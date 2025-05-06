
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

serve(async (req) => {
  // Handle preflight CORS requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Testing connection to Asterisk server");

    // Hard-coded Asterisk configuration
    const serverIp = "192.168.0.197";
    const port = "8088";
    const username = "admin";
    const password = "admin";
    const url = `http://${serverIp}:${port}/ari/applications`;

    console.log(`Making request to: ${url}`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (increased from 10)

    try {
      // Make request to Asterisk ARI
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${btoa(`${username}:${password}`)}`,
          "Accept": "application/json",
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log("Received response with status:", response.status);
      
      if (response.ok) {
        try {
          // Parse response to verify it's valid JSON
          const data = await response.json();
          console.log("Response data:", data);
          
          return new Response(
            JSON.stringify({
              success: true,
              message: "Successfully connected to Asterisk ARI",
              data: data
            }),
            { headers: corsHeaders }
          );
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          return new Response(
            JSON.stringify({
              success: false,
              message: "Connected to server but received invalid JSON response"
            }),
            { headers: corsHeaders }
          );
        }
      } else {
        // Handle non-200 responses
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || response.statusText;
        } catch {
          errorMessage = response.statusText;
        }
        
        return new Response(
          JSON.stringify({
            success: false,
            message: `Error connecting to Asterisk: ${errorMessage} (Status: ${response.status})`
          }),
          { headers: corsHeaders }
        );
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      
      // Handle different types of fetch errors
      let errorMessage = "Unknown error connecting to Asterisk";
      
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        errorMessage = `Connection to Asterisk timed out. Please verify the server is running at ${serverIp}:${port} and that ARI is enabled.`;
      } else if (fetchError instanceof Error) {
        errorMessage = fetchError.message;
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          message: errorMessage
        }),
        { headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Unhandled error in test-asterisk-connection:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
