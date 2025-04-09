
// dialer-status edge function - retrieves the status of a dialer job
import { serve } from "https://deno.land/std@0.184.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    const campaignId = url.searchParams.get("campaignId");
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { headers, status: 400 }
      );
    }

    // Query based on job ID or campaign ID
    let query = supabase
      .from("dialer_jobs")
      .select(`
        *,
        dialer_queue!inner(
          status,
          phone_number
        ),
        call_logs!inner(
          status,
          phone_number,
          duration,
          transfer_requested,
          transfer_successful,
          created_at
        )
      `)
      .eq("user_id", userId);

    if (jobId) {
      query = query.eq("id", jobId);
    } else if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    } else {
      return new Response(
        JSON.stringify({ error: "Either Job ID or Campaign ID is required" }),
        { headers, status: 400 }
      );
    }

    // Get the job(s)
    const { data, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch dialer job status", details: error }),
        { headers, status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "Dialer job not found" }),
        { headers, status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ data }),
      { headers, status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dialer job status:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers, status: 500 }
    );
  }
});
