
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Set a shorter timeout for database operations (in ms)
const DB_OPERATION_TIMEOUT = 6000;

// Create a promise that rejects after a timeout
const timeoutPromise = (ms: number) => new Promise((_, reject) => {
  setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    console.log("Grant lifetime access function called");
    
    // Create a Supabase client with reasonable timeout settings
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );

    // Get request body
    const { targetUserId, adminToken } = await req.json();
    
    if (!targetUserId) {
      console.error("Target user ID is required");
      return new Response(
        JSON.stringify({ error: 'Target user ID is required', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!adminToken) {
      console.error("Admin token is required");
      return new Response(
        JSON.stringify({ error: 'Admin token is required', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Verify the requesting user is an admin
    try {
      // Get the user from the JWT token
      const { data: authData, error: authError } = await Promise.race([
        supabaseClient.auth.getUser(adminToken), // Use the provided JWT token
        timeoutPromise(DB_OPERATION_TIMEOUT)
      ]);
      
      if (authError || !authData.user) {
        console.error("Invalid admin authentication:", authError);
        return new Response(
          JSON.stringify({ error: 'Invalid admin authentication', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      // Check if the requesting user is an admin
      const { data: adminProfile, error: profileError } = await Promise.race([
        supabaseClient
          .from('profiles')
          .select('is_admin')
          .eq('id', authData.user.id)
          .single(),
        timeoutPromise(DB_OPERATION_TIMEOUT)
      ]);
      
      if (profileError) {
        console.error("Error checking admin profile:", profileError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify admin status', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      if (!adminProfile || !adminProfile.is_admin) {
        console.error("Requesting user is not an admin");
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Admin privileges required', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
      
      console.log(`Admin user ${authData.user.id} is granting lifetime access to user ${targetUserId}`);
      
      // First check if the user already has a subscription
      const { data: existingSubscription, error: subscriptionError } = await Promise.race([
        supabaseClient
          .from('subscriptions')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle(),
        timeoutPromise(DB_OPERATION_TIMEOUT)
      ]);
      
      if (subscriptionError) {
        console.error(`Subscription check error:`, subscriptionError);
        return new Response(
          JSON.stringify({ error: 'Error checking existing subscription', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      let subscriptionResult;
      
      if (existingSubscription) {
        // Update existing subscription
        console.log(`Updating existing subscription for user ${targetUserId}`);
        const { data, error } = await Promise.race([
          supabaseClient
            .from('subscriptions')
            .update({
              plan_id: 'lifetime',
              plan_name: 'Lifetime Access',
              status: 'active',
              current_period_end: null, // Null for lifetime plans
              updated_at: new Date().toISOString()
            })
            .eq('user_id', targetUserId)
            .select()
            .single(),
          timeoutPromise(DB_OPERATION_TIMEOUT)
        ]);
        
        if (error) {
          throw error;
        }
        
        subscriptionResult = data;
      } else {
        // Insert new subscription
        console.log(`Creating new subscription for user ${targetUserId}`);
        const { data, error } = await Promise.race([
          supabaseClient
            .from('subscriptions')
            .insert({
              user_id: targetUserId,
              plan_id: 'lifetime',
              plan_name: 'Lifetime Access',
              status: 'active',
              current_period_end: null, // Null for lifetime plans
              updated_at: new Date().toISOString()
            })
            .select()
            .single(),
          timeoutPromise(DB_OPERATION_TIMEOUT)
        ]);
        
        if (error) {
          console.error(`Error creating subscription:`, error);
          throw error;
        }
        
        subscriptionResult = data;
      }
      
      console.log(`Successfully granted lifetime access to user ${targetUserId}`);
      
      // Record the action in the payments table
      try {
        await Promise.race([
          supabaseClient
            .from('payments')
            .insert({
              user_id: targetUserId,
              amount: 0, // Free upgrade by admin
              payment_method: 'admin_grant',
              plan_id: 'lifetime',
              status: 'completed',
              payment_details: {
                granted_by: authData.user.id,
                granted_at: new Date().toISOString(),
                note: 'Lifetime access granted by admin'
              }
            }),
          timeoutPromise(DB_OPERATION_TIMEOUT)
        ]);
      } catch (paymentError) {
        // Just log the error but don't fail the whole operation
        console.error(`Error recording payment: ${paymentError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          message: 'Lifetime access granted successfully', 
          success: true,
          subscription: subscriptionResult
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
      
    } catch (error) {
      console.error(`Error processing request: ${error.message}`);
      return new Response(
        JSON.stringify({ error: error.message, success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error in grant-lifetime-access function: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
