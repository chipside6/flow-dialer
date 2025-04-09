
// autodialer edge function - handles dialing operations
import { serve } from "https://deno.land/std@0.184.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Asterisk connection details
const ASTERISK_HOST = Deno.env.get("ASTERISK_HOST") || "localhost";
const ASTERISK_PORT = parseInt(Deno.env.get("ASTERISK_PORT") || "8088");
const ASTERISK_USER = Deno.env.get("ASTERISK_USER") || "admin";
const ASTERISK_PASSWORD = Deno.env.get("ASTERISK_PASSWORD") || "password";
const AGI_SCRIPT_PATH = Deno.env.get("AGI_SCRIPT_PATH") || "autodialer.agi";

interface DialerJobRequest {
  campaignId: string;
  userId: string;
}

interface OriginateResponse {
  response: string;
  actionid: string;
  message?: string;
  success?: boolean;
}

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
    // Get request body
    const body = await req.json() as DialerJobRequest;
    const { campaignId, userId } = body;

    if (!campaignId || !userId) {
      return new Response(
        JSON.stringify({ error: "Campaign ID and User ID are required" }),
        { headers, status: 400 }
      );
    }

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*, contact_list_id")
      .eq("id", campaignId)
      .eq("user_id", userId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: "Campaign not found", details: campaignError }),
        { headers, status: 404 }
      );
    }

    // Validate campaign has required fields
    if (!campaign.caller_id || !campaign.transfer_number || !campaign.greeting_file_url) {
      return new Response(
        JSON.stringify({ 
          error: "Campaign is missing required fields", 
          missing: [
            !campaign.caller_id ? "caller_id" : null,
            !campaign.transfer_number ? "transfer_number" : null,
            !campaign.greeting_file_url ? "greeting_file_url" : null,
          ].filter(Boolean)
        }),
        { headers, status: 400 }
      );
    }

    // Create a new dialer job
    const { data: job, error: jobError } = await supabase
      .from("dialer_jobs")
      .insert({
        user_id: userId,
        campaign_id: campaignId,
        status: "pending",
        start_time: new Date().toISOString()
      })
      .select()
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: "Failed to create dialer job", details: jobError }),
        { headers, status: 500 }
      );
    }

    // Get contact list for the campaign
    if (!campaign.contact_list_id) {
      await updateJobStatus(job.id, "failed", "No contact list assigned to campaign");
      return new Response(
        JSON.stringify({ error: "No contact list assigned to campaign" }),
        { headers, status: 400 }
      );
    }

    // Fetch phone numbers from the contact list
    const { data: contacts, error: contactsError } = await supabase
      .from("contact_list_items")
      .select("contacts(phone_number)")
      .eq("contact_list_id", campaign.contact_list_id);

    if (contactsError || !contacts) {
      await updateJobStatus(job.id, "failed", "Failed to fetch contacts");
      return new Response(
        JSON.stringify({ error: "Failed to fetch contacts", details: contactsError }),
        { headers, status: 500 }
      );
    }

    // Extract phone numbers
    const phoneNumbers = contacts
      .map(item => item.contacts?.phone_number)
      .filter(Boolean) as string[];

    if (phoneNumbers.length === 0) {
      await updateJobStatus(job.id, "failed", "No valid phone numbers in contact list");
      return new Response(
        JSON.stringify({ error: "No valid phone numbers in contact list" }),
        { headers, status: 400 }
      );
    }

    // Update job with total calls count
    await supabase
      .from("dialer_jobs")
      .update({ 
        total_calls: phoneNumbers.length,
        status: "in_progress"
      })
      .eq("id", job.id);

    // Add phone numbers to dialer queue
    const queueItems = phoneNumbers.map(phoneNumber => ({
      job_id: job.id,
      user_id: userId,
      campaign_id: campaignId,
      phone_number: phoneNumber,
      status: "queued"
    }));

    const { error: queueError } = await supabase
      .from("dialer_queue")
      .insert(queueItems);

    if (queueError) {
      await updateJobStatus(job.id, "failed", "Failed to queue phone numbers");
      return new Response(
        JSON.stringify({ error: "Failed to queue phone numbers", details: queueError }),
        { headers, status: 500 }
      );
    }

    // Start the background dialing process
    EdgeRuntime.waitUntil(processDialerQueue(job.id, campaign));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Dialer job created and started",
        jobId: job.id,
        totalCalls: phoneNumbers.length
      }),
      { headers, status: 200 }
    );
  } catch (error) {
    console.error("Error processing dialer job:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers, status: 500 }
    );
  }
});

// Helper function to update job status
async function updateJobStatus(jobId: string, status: string, message?: string) {
  const updates: any = { status };
  
  if (status === "completed" || status === "failed") {
    updates.end_time = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from("dialer_jobs")
    .update(updates)
    .eq("id", jobId);
    
  if (error) {
    console.error(`Failed to update job ${jobId} status to ${status}:`, error);
  }
  
  if (message) {
    // Log the status message
    await supabase
      .from("call_logs")
      .insert({
        user_id: (await getJobUserId(jobId)) || "",
        campaign_id: (await getJobCampaignId(jobId)) || "",
        phone_number: "system",
        status: "system",
        notes: message
      });
  }
}

// Helper function to get job user ID
async function getJobUserId(jobId: string): Promise<string | null> {
  const { data } = await supabase
    .from("dialer_jobs")
    .select("user_id")
    .eq("id", jobId)
    .single();
    
  return data?.user_id || null;
}

// Helper function to get job campaign ID
async function getJobCampaignId(jobId: string): Promise<string | null> {
  const { data } = await supabase
    .from("dialer_jobs")
    .select("campaign_id")
    .eq("id", jobId)
    .single();
    
  return data?.campaign_id || null;
}

// Process the dialer queue in batches with concurrency control
async function processDialerQueue(jobId: string, campaign: any) {
  try {
    const maxConcurrentCalls = campaign.max_concurrent_calls || 1;
    let activeCalls = 0;
    let completedCalls = 0;
    let successfulCalls = 0;
    let failedCalls = 0;
    let isProcessing = true;

    while (isProcessing) {
      // Check if job was cancelled
      const { data: jobData } = await supabase
        .from("dialer_jobs")
        .select("status")
        .eq("id", jobId)
        .single();
        
      if (jobData?.status === "cancelled") {
        console.log(`Job ${jobId} was cancelled, stopping processing`);
        break;
      }

      // Get next batch of numbers to dial
      const availableSlots = maxConcurrentCalls - activeCalls;
      
      if (availableSlots <= 0) {
        // Wait for some calls to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      const { data: queueItems } = await supabase
        .from("dialer_queue")
        .select("*")
        .eq("job_id", jobId)
        .eq("status", "queued")
        .order("created_at", { ascending: true })
        .limit(availableSlots);

      if (!queueItems || queueItems.length === 0) {
        // Check if there are any processing items left
        const { data: processingItems } = await supabase
          .from("dialer_queue")
          .select("count", { count: "exact", head: true })
          .eq("job_id", jobId)
          .eq("status", "processing");
          
        if (!processingItems || processingItems.length === 0) {
          isProcessing = false;
          break;
        }
        
        // Wait and check again
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      // Process each queue item
      for (const item of queueItems) {
        activeCalls++;
        
        // Mark as processing
        await supabase
          .from("dialer_queue")
          .update({ 
            status: "processing",
            attempts: item.attempts + 1,
            last_attempt: new Date().toISOString()
          })
          .eq("id", item.id);

        // Make the call in background
        EdgeRuntime.waitUntil((async () => {
          try {
            // Generate the Asterisk call command
            const result = await originateCall(
              item.phone_number,
              campaign.caller_id,
              campaign.transfer_number,
              campaign.greeting_file_url,
              campaign.user_id,
              campaign.id
            );

            // Update queue item status
            const status = result.success ? "completed" : "failed";
            await supabase
              .from("dialer_queue")
              .update({ status })
              .eq("id", item.id);

            // Log the call
            await supabase
              .from("call_logs")
              .insert({
                user_id: campaign.user_id,
                campaign_id: campaign.id,
                phone_number: item.phone_number,
                status: result.message || status,
                notes: JSON.stringify(result)
              });

            // Update counters
            completedCalls++;
            if (result.success) {
              successfulCalls++;
            } else {
              failedCalls++;
            }

            // Update job progress
            await supabase
              .from("dialer_jobs")
              .update({ 
                completed_calls: completedCalls,
                successful_calls: successfulCalls,
                failed_calls: failedCalls
              })
              .eq("id", jobId);

          } catch (error) {
            console.error(`Error processing call to ${item.phone_number}:`, error);
            
            // Update queue item as failed
            await supabase
              .from("dialer_queue")
              .update({ 
                status: "failed"
              })
              .eq("id", item.id);

            // Log the error
            await supabase
              .from("call_logs")
              .insert({
                user_id: campaign.user_id,
                campaign_id: campaign.id,
                phone_number: item.phone_number,
                status: "error",
                notes: error.message || "Unknown error"
              });

            failedCalls++;
            completedCalls++;
            
            // Update job progress
            await supabase
              .from("dialer_jobs")
              .update({ 
                completed_calls: completedCalls,
                failed_calls: failedCalls
              })
              .eq("id", jobId);
          } finally {
            activeCalls--;
          }
        })());
      }

      // Avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // All done - update job status
    await updateJobStatus(jobId, "completed");
    console.log(`Job ${jobId} completed. Total calls: ${completedCalls}`);

  } catch (error) {
    console.error(`Error processing dialer queue for job ${jobId}:`, error);
    await updateJobStatus(jobId, "failed", error.message);
  }
}

// Function to send the originate command to Asterisk
async function originateCall(
  phoneNumber: string,
  callerId: string,
  transferNumber: string,
  greetingFile: string,
  userId: string,
  campaignId: string
): Promise<OriginateResponse> {
  try {
    // Normalize phone number by removing non-numeric characters
    phoneNumber = phoneNumber.replace(/\D/g, "");
    
    // The port to use on GoIP device (default to 1)
    const port = 1;

    // Construct ARI API URL for the originate action
    const ariUrl = `http://${ASTERISK_HOST}:${ASTERISK_PORT}/ari/channels`;
    
    // Prepare the originate parameters
    const originateData = {
      endpoint: `SIP/goip/${port}/${phoneNumber}`,
      callerId: callerId,
      context: "autodialer",
      priority: 1,
      extension: "s",
      variables: {
        GREETING_FILE: greetingFile,
        TRANSFER_NUMBER: transferNumber,
        USER_ID: userId,
        CAMPAIGN_ID: campaignId
      }
    };

    // Send the originate request
    const response = await fetch(ariUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${ASTERISK_USER}:${ASTERISK_PASSWORD}`)}`
      },
      body: JSON.stringify(originateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        response: "error",
        actionid: "0",
        message: `Asterisk API error: ${errorText}`,
        success: false
      };
    }

    const responseData = await response.json();
    
    return {
      response: "success",
      actionid: responseData.id || "unknown",
      message: "Call originated successfully",
      success: true
    };
  } catch (error) {
    console.error("Error originating call:", error);
    return {
      response: "error",
      actionid: "0",
      message: `Exception: ${error.message}`,
      success: false
    };
  }
}
