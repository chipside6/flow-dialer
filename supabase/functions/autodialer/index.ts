
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

interface AutoDialerRequest {
  campaignId: string;
  userId: string;
  portNumbers: number[];
  greetingFileUrl?: string;
  transferNumber?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate request
    const { authorization } = req.headers;
    if (!authorization) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authorization required' }),
        { headers: { ...corsHeaders }, status: 401 }
      );
    }

    // Create authenticated client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authorization },
        },
      }
    );

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized user' }),
        { headers: { ...corsHeaders }, status: 401 }
      );
    }

    // Get request data
    const reqData: AutoDialerRequest = await req.json();
    const { campaignId, userId, portNumbers, greetingFileUrl, transferNumber } = reqData;

    if (!campaignId || !userId || !portNumbers || portNumbers.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { headers: { ...corsHeaders }, status: 400 }
      );
    }

    // Validate user permissions
    if (userId !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        return new Response(
          JSON.stringify({ success: false, message: 'Permission denied' }),
          { headers: { ...corsHeaders }, status: 403 }
        );
      }
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ success: false, message: 'Campaign not found' }),
        { headers: { ...corsHeaders }, status: 404 }
      );
    }

    // Get contact list
    const { data: contactList, error: contactListError } = await supabase
      .from('contact_list_items')
      .select(`
        contact_id, 
        contacts(id, phone_number, first_name, last_name)
      `)
      .eq('contact_list_id', campaign.contact_list_id);

    if (contactListError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Error retrieving contacts' }),
        { headers: { ...corsHeaders }, status: 500 }
      );
    }

    if (!contactList || contactList.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No contacts in list' }),
        { headers: { ...corsHeaders }, status: 400 }
      );
    }

    // Create dialer job in database
    const { data: job, error: jobError } = await supabase
      .from('dialer_jobs')
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        status: 'starting',
        total_calls: contactList.length,
        max_concurrent_calls: portNumbers.length,
        available_ports: portNumbers.length,
        start_time: new Date().toISOString()
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating dialer job:', jobError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create dialer job' }),
        { headers: { ...corsHeaders }, status: 500 }
      );
    }

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({ status: 'running' })
      .eq('id', campaignId);

    // Setup call queue in database
    const queueItems = contactList.map((item: any) => ({
      job_id: job.id,
      campaign_id: campaignId,
      user_id: userId,
      phone_number: item.contacts.phone_number,
      status: 'queued'
    }));

    const { error: queueError } = await supabase
      .from('dialer_queue')
      .insert(queueItems);

    if (queueError) {
      console.error('Error creating call queue:', queueError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create call queue' }),
        { headers: { ...corsHeaders }, status: 500 }
      );
    }

    // Initialize port assignments
    for (const portNumber of portNumbers) {
      await supabase.from('user_trunks')
        .update({ 
          status: 'ready',
          current_campaign_id: campaignId
        })
        .eq('user_id', userId)
        .eq('port_number', portNumber);
    }

    // Connect to Asterisk and setup ARI
    const asteriskServerIp = Deno.env.get('ASTERISK_SERVER_HOST') || '192.168.0.197';
    const asteriskUsername = Deno.env.get('ASTERISK_SERVER_USER') || 'admin';
    const asteriskPassword = Deno.env.get('ASTERISK_SERVER_PASS') || 'admin';
    const asteriskPort = Deno.env.get('ASTERISK_SERVER_PORT') || '8088';
    
    // Instead of directly connecting here, we'll initiate the dialer service
    // and let a background process handle the actual calls
    
    // Start background processing
    EdgeRuntime.waitUntil(processDialerQueue(
      supabaseClient,
      job.id,
      userId,
      campaignId,
      portNumbers,
      greetingFileUrl || campaign.greeting_file_url,
      transferNumber || campaign.transfer_number,
      asteriskServerIp,
      asteriskPort,
      asteriskUsername,
      asteriskPassword
    ));

    // Return success and job details
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dialer started successfully',
        job: {
          id: job.id,
          totalCalls: contactList.length,
          portsUsed: portNumbers.length
        }
      }),
      { headers: { ...corsHeaders } }
    );
  } catch (error) {
    console.error('Autodialer error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { headers: { ...corsHeaders }, status: 500 }
    );
  }
});

// Background task to process the dialer queue
async function processDialerQueue(
  supabase: any,
  jobId: string,
  userId: string,
  campaignId: string,
  portNumbers: number[],
  greetingFileUrl: string | undefined,
  transferNumber: string | undefined,
  asteriskHost: string,
  asteriskPort: string,
  asteriskUser: string,
  asteriskPass: string
): Promise<void> {
  console.log(`Starting dialer queue processing for job: ${jobId}`);
  
  try {
    // Update job status
    await supabase
      .from('dialer_jobs')
      .update({ status: 'running' })
      .eq('id', jobId);
      
    // Start calls based on available ports
    const availablePorts = [...portNumbers];
    const usedPorts = new Set<number>();
    let activeCalls = 0;
    let processedCalls = 0;
    let successfulCalls = 0;
    let failedCalls = 0;
    
    // Main processing loop - continue until no more calls or job is cancelled
    let isRunning = true;
    
    while (isRunning) {
      // Check if job is cancelled
      const { data: jobData } = await supabase
        .from('dialer_jobs')
        .select('status')
        .eq('id', jobId)
        .single();
        
      if (jobData?.status === 'cancelled') {
        console.log(`Job ${jobId} was cancelled. Stopping queue processing.`);
        isRunning = false;
        break;
      }
      
      // Get next batch of calls from queue
      const { data: queueItems } = await supabase
        .from('dialer_queue')
        .select('id, phone_number')
        .eq('job_id', jobId)
        .eq('status', 'queued')
        .limit(availablePorts.length - usedPorts.size);
      
      if (!queueItems || queueItems.length === 0) {
        if (usedPorts.size === 0) {
          // No more calls to process and no active calls
          console.log(`All calls processed for job ${jobId}`);
          isRunning = false;
          break;
        }
        
        // Wait for active calls to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      
      // Process each queue item
      for (const item of queueItems) {
        if (availablePorts.length <= usedPorts.size) {
          // No ports available, wait and try again
          break;
        }
        
        // Get next available port
        const portNumber = availablePorts.find(p => !usedPorts.has(p));
        if (!portNumber) continue;
        
        // Mark port as used
        usedPorts.add(portNumber);
        
        // Update queue item
        await supabase
          .from('dialer_queue')
          .update({ 
            status: 'processing',
            port_number: portNumber,
            last_attempt: new Date().toISOString(),
            attempts: supabase.rpc('increment', { row_id: item.id, x: 1 })
          })
          .eq('id', item.id);
        
        // Initiate call via Asterisk ARI
        try {
          // Construct authorization header for Asterisk ARI
          const ariAuthHeader = `Basic ${btoa(`${asteriskUser}:${asteriskPass}`)}`;
          
          // Use Fetch API to make request to Asterisk ARI
          const ariResponse = await fetch(
            `http://${asteriskHost}:${asteriskPort}/ari/channels?endpoint=SIP/goip_${userId}_port${portNumber}/${item.phone_number}&callerId=${item.phone_number}&app=autodialer&appArgs=${campaignId},${jobId},${transferNumber || ''}`,
            {
              method: 'POST',
              headers: {
                'Authorization': ariAuthHeader,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (ariResponse.ok) {
            const channelData = await ariResponse.json();
            
            // Log call start
            await supabase
              .from('call_logs')
              .insert({
                campaign_id: campaignId,
                user_id: userId,
                phone_number: item.phone_number,
                status: 'initiated',
                created_at: new Date().toISOString()
              });
              
            // Update queue item status
            await supabase
              .from('dialer_queue')
              .update({ status: 'in-progress' })
              .eq('id', item.id);
              
            activeCalls++;
            
            // In a real implementation, we would listen for events from Asterisk
            // to determine call status, but for now we'll simulate async completion
            
            // For demo purposes only - in production, we would use ARI events
            setTimeout(async () => {
              // Simulate call completion
              await supabase
                .from('dialer_queue')
                .update({ status: 'completed' })
                .eq('id', item.id);
                
              processedCalls++;
              successfulCalls++;
              activeCalls--;
              
              // Release port
              usedPorts.delete(portNumber);
              
              // Update job stats
              await supabase
                .from('dialer_jobs')
                .update({ 
                  completed_calls: processedCalls,
                  successful_calls: successfulCalls,
                  failed_calls: failedCalls
                })
                .eq('id', jobId);
            }, Math.random() * 10000 + 5000); // Random duration between 5-15 seconds
          } else {
            // Call failed to initiate
            const errorText = await ariResponse.text();
            console.error(`Failed to initiate call: ${errorText}`);
            
            // Update queue item
            await supabase
              .from('dialer_queue')
              .update({ 
                status: 'failed',
                last_attempt: new Date().toISOString()
              })
              .eq('id', item.id);
              
            // Release port
            usedPorts.delete(portNumber);
            
            processedCalls++;
            failedCalls++;
            
            // Update call logs
            await supabase
              .from('call_logs')
              .insert({
                campaign_id: campaignId,
                user_id: userId,
                phone_number: item.phone_number,
                status: 'failed',
                notes: `Failed to initiate: ${errorText.substring(0, 100)}`,
                created_at: new Date().toISOString()
              });
              
            // Update job stats
            await supabase
              .from('dialer_jobs')
              .update({ 
                completed_calls: processedCalls,
                successful_calls: successfulCalls,
                failed_calls: failedCalls
              })
              .eq('id', jobId);
          }
        } catch (error) {
          console.error(`Error initiating call to ${item.phone_number}:`, error);
          
          // Update queue item
          await supabase
            .from('dialer_queue')
            .update({ 
              status: 'error',
              last_attempt: new Date().toISOString()
            })
            .eq('id', item.id);
            
          // Release port
          usedPorts.delete(portNumber);
          
          processedCalls++;
          failedCalls++;
          
          // Update job stats
          await supabase
            .from('dialer_jobs')
            .update({ 
              completed_calls: processedCalls,
              successful_calls: successfulCalls,
              failed_calls: failedCalls
            })
            .eq('id', jobId);
        }
      }
      
      // Wait before processing next batch
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Complete job if all calls processed
    await supabase
      .from('dialer_jobs')
      .update({ 
        status: 'completed',
        end_time: new Date().toISOString(),
        completed_calls: processedCalls,
        successful_calls: successfulCalls,
        failed_calls: failedCalls
      })
      .eq('id', jobId);
      
    // Reset port status
    for (const portNumber of portNumbers) {
      await supabase
        .from('user_trunks')
        .update({ 
          status: 'available',
          current_campaign_id: null
        })
        .eq('user_id', userId)
        .eq('port_number', portNumber);
    }
      
    console.log(`Completed dialer job ${jobId} with ${successfulCalls} successful calls and ${failedCalls} failed calls`);
    
  } catch (error) {
    console.error(`Error in background task for job ${jobId}:`, error);
    
    // Update job as failed
    await supabase
      .from('dialer_jobs')
      .update({ 
        status: 'failed',
        end_time: new Date().toISOString()
      })
      .eq('id', jobId);
      
    // Reset port status
    for (const portNumber of portNumbers) {
      await supabase
        .from('user_trunks')
        .update({ status: 'available', current_campaign_id: null })
        .eq('user_id', userId)
        .eq('port_number', portNumber);
    }
  }
}
