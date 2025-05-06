
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

interface CampaignStartRequest {
  campaignId: string;
  userId: string;
  portNumbers: number[];
  greetingFileUrl?: string;
  transferNumber?: string;
}

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
        JSON.stringify({ 
          success: false, 
          error: "No authorization header", 
          message: "Authentication is required" 
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid user token",
          message: "User authentication failed" 
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Get request data
    let requestData: CampaignStartRequest;
    try {
      requestData = await req.json() as CampaignStartRequest;
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid request format",
          message: "Request body must be valid JSON" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { campaignId, userId, portNumbers, greetingFileUrl, transferNumber } = requestData;
    
    if (!campaignId || !userId || !portNumbers || portNumbers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters",
          message: "campaignId, userId, and portNumbers are required" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify user permissions
    if (userId !== user.id) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      const isAdmin = userProfile?.is_admin === true;
      
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Permission denied",
            message: "You don't have permission to access this resource" 
          }),
          { status: 403, headers: corsHeaders }
        );
      }
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        contact_list_id,
        greeting_file_url,
        transfer_number
      `)
      .eq('id', campaignId)
      .maybeSingle();

    if (campaignError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error",
          message: `Error fetching campaign: ${campaignError.message}` 
        }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    if (!campaign) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Campaign not found",
          message: "The requested campaign does not exist or you don't have access to it"
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Get contact list
    if (!campaign.contact_list_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No contact list",
          message: "Campaign has no contact list assigned" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch contacts from the contact list
    const { data: contactItems, error: contactItemsError } = await supabase
      .from('contact_list_items')
      .select(`
        contact_id
      `)
      .eq('contact_list_id', campaign.contact_list_id);

    if (contactItemsError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error",
          message: `Error fetching contacts: ${contactItemsError.message}` 
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!contactItems || contactItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Empty contact list",
          message: "The contact list has no contacts" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const contactIds = contactItems.map(item => item.contact_id);

    // Fetch contact details
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select(`
        id,
        phone_number,
        first_name,
        last_name
      `)
      .in('id', contactIds);

    if (contactsError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error",
          message: `Error fetching contact details: ${contactsError.message}` 
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No valid contacts",
          message: "No valid contacts found in the contact list" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate Asterisk ARI call origination
    const phoneNumbers = contacts.map(contact => contact.phone_number);
    
    // Create a dialer job
    const { data: job, error: jobError } = await supabase
      .from('dialer_jobs')
      .insert({
        user_id: userId,
        campaign_id: campaignId,
        status: 'pending',
        total_calls: phoneNumbers.length,
        max_concurrent_calls: portNumbers.length,
        start_time: new Date().toISOString()
      })
      .select()
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to create dialer job",
          message: jobError ? jobError.message : "Unknown error creating job"
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({ status: 'in_progress' })
      .eq('id', campaignId);

    // Process in background
    EdgeRuntime.waitUntil(startDialingProcess(
      supabaseAdmin,
      job.id,
      phoneNumbers,
      userId,
      campaignId,
      portNumbers,
      greetingFileUrl || campaign.greeting_file_url,
      transferNumber || campaign.transfer_number
    ));

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Campaign started successfully with ${phoneNumbers.length} contacts and ${portNumbers.length} ports`,
        jobId: job.id
      }),
      { headers: corsHeaders }
    );
    
  } catch (error) {
    console.error("Error starting campaign:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Server error",
        message: error instanceof Error ? error.message : "Unknown server error"
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function startDialingProcess(
  supabase: any,
  jobId: string,
  phoneNumbers: string[],
  userId: string,
  campaignId: string,
  portNumbers: number[],
  greetingFileUrl?: string,
  transferNumber?: string
) {
  try {
    console.log(`Starting dialing process for job ${jobId}`);
    console.log(`Using ports: ${portNumbers.join(', ')}`);
    
    // Mark job as in progress
    await supabase
      .from('dialer_jobs')
      .update({
        status: 'in_progress',
      })
      .eq('id', jobId);
    
    // Setup call parameters
    const asteriskServerIp = "192.168.0.197";
    const asteriskPort = 8088;
    const asteriskUsername = "admin";
    const asteriskPassword = "admin";
    
    // Add all numbers to the queue
    for (const phoneNumber of phoneNumbers) {
      await supabase
        .from('dialer_queue')
        .insert({
          job_id: jobId,
          user_id: userId,
          campaign_id: campaignId,
          phone_number: phoneNumber,
          status: 'queued'
        });
    }
    
    // Start dialing - in a real implementation, this would distribute calls across ports
    let activeCalls = 0;
    let completedCalls = 0;
    let portIndex = 0;
    
    // Process the queue in batches
    while (true) {
      // Check if job was cancelled
      const { data: jobData } = await supabase
        .from('dialer_jobs')
        .select('status')
        .eq('id', jobId)
        .single();
        
      if (jobData?.status === 'cancelled') {
        console.log(`Job ${jobId} was cancelled`);
        break;
      }
      
      // Get next batch of calls
      const availableSlots = portNumbers.length - activeCalls;
      
      if (availableSlots <= 0) {
        // Wait for some calls to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      
      const { data: queueItems } = await supabase
        .from('dialer_queue')
        .select('*')
        .eq('job_id', jobId)
        .eq('status', 'queued')
        .order('created_at', { ascending: true })
        .limit(availableSlots);
      
      if (!queueItems || queueItems.length === 0) {
        // Check if all calls are complete
        const { data: remainingItems } = await supabase
          .from('dialer_queue')
          .select('count', { count: 'exact', head: true })
          .eq('job_id', jobId)
          .neq('status', 'completed')
          .neq('status', 'failed');
          
        if (remainingItems?.count === 0) {
          break;
        }
        
        // Wait and check again
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      
      // Process each item
      for (const item of queueItems) {
        const portNumber = portNumbers[portIndex % portNumbers.length];
        portIndex++;
        
        activeCalls++;
        
        // Mark as processing
        await supabase
          .from('dialer_queue')
          .update({
            status: 'processing',
            port_number: portNumber,
            attempts: item.attempts + 1,
            last_attempt: new Date().toISOString()
          })
          .eq('id', item.id);
        
        // Make the call (in background)
        EdgeRuntime.waitUntil((async () => {
          try {
            console.log(`Dialing ${item.phone_number} on port ${portNumber}`);
            
            // Call Asterisk ARI to originate the call
            const apiUrl = `http://${asteriskServerIp}:${asteriskPort}/ari/channels`;
            const auth = btoa(`${asteriskUsername}:${asteriskPassword}`);
            
            // Construct endpoint based on port
            const endpoint = `PJSIP/port${portNumber}/${item.phone_number}`;
            
            // Prepare variables for the dialplan
            const variables = {
              GREETING_FILE: greetingFileUrl || 'beep',
              TRANSFER_NUMBER: transferNumber || '',
              CAMPAIGN_ID: campaignId,
              USER_ID: userId,
              PORT_NUMBER: portNumber.toString()
            };
            
            // Make the originate request
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
              },
              body: JSON.stringify({
                endpoint,
                context: 'campaign-autodialer',
                extension: 's',
                priority: 1,
                callerId: `Campaign ${campaignId}`,
                variables
              })
            });
            
            if (!response.ok) {
              throw new Error(`Failed to originate call: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Log the successful origination
            console.log(`Call originated successfully with ID: ${result.id}`);
            
            // Mark queue item as completed
            await supabase
              .from('dialer_queue')
              .update({
                status: 'completed'
              })
              .eq('id', item.id);
            
            // Log the call
            await supabase
              .from('call_logs')
              .insert({
                user_id: userId,
                campaign_id: campaignId,
                phone_number: item.phone_number,
                status: 'started',
                notes: `Call originated on port ${portNumber}`
              });
            
            completedCalls++;
            
            // Update job stats
            await supabase
              .from('dialer_jobs')
              .update({
                completed_calls: completedCalls
              })
              .eq('id', jobId);
            
          } catch (error) {
            console.error(`Error processing call to ${item.phone_number}:`, error);
            
            // Mark as failed
            await supabase
              .from('dialer_queue')
              .update({
                status: 'failed'
              })
              .eq('id', item.id);
            
            // Log the error
            await supabase
              .from('call_logs')
              .insert({
                user_id: userId,
                campaign_id: campaignId,
                phone_number: item.phone_number,
                status: 'error',
                notes: error instanceof Error ? error.message : 'Unknown error'
              });
          } finally {
            activeCalls--;
          }
        })());
      }
      
      // Avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Mark job as completed
    await supabase
      .from('dialer_jobs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString()
      })
      .eq('id', jobId);
    
    console.log(`Dialing process completed for job ${jobId}`);
    
  } catch (error) {
    console.error(`Error in dialing process for job ${jobId}:`, error);
    
    // Mark job as failed
    await supabase
      .from('dialer_jobs')
      .update({
        status: 'failed',
        end_time: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}
