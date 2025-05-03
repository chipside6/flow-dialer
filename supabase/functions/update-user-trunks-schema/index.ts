
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

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
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if the column exists
    const { data: columns, error: columnsError } = await supabaseAdmin.rpc('column_exists', {
      table_name: 'user_trunks',
      column_name: 'device_ip'
    });
    
    if (columnsError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error checking column existence: ${columnsError.message}` 
        }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    // If the column doesn't exist, add it
    if (!columns) {
      // Execute SQL to add the column
      const { error: alterError } = await supabaseAdmin.rpc(
        'execute_sql',
        { sql: 'ALTER TABLE user_trunks ADD COLUMN IF NOT EXISTS device_ip TEXT;' }
      );
      
      if (alterError) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Error adding column: ${alterError.message}` 
          }),
          { status: 500, headers: corsHeaders }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Added device_ip column to user_trunks table" 
        }),
        { headers: corsHeaders }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Column device_ip already exists in user_trunks table" 
      }),
      { headers: corsHeaders }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
