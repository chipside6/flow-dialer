
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { handleRequest } from "./handlers/requestHandler.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return await handleRequest(req);
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
