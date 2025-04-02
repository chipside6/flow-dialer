
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
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
    
    // Verify the requesting user is an admin
    const { data: authData, error: authError } = await supabaseClient.auth.getUser(adminToken);
    
    if (authError || !authData.user) {
      console.error("Invalid admin authentication");
      return new Response(
        JSON.stringify({ error: 'Invalid admin authentication', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Check if the requesting user is an admin
    const { data: adminProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError || !adminProfile || !adminProfile.is_admin) {
      console.error("Requesting user is not an admin");
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin privileges required', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    console.log(`Admin user ${authData.user.id} is granting lifetime access to user ${targetUserId}`);
    
    // Create or update lifetime subscription for the target user
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: targetUserId,
        plan_id: 'lifetime',
        plan_name: 'Lifetime Access',
        status: 'active',
        current_period_end: null, // Null for lifetime plans
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select();
    
    if (subscriptionError) {
      console.error(`Error granting lifetime access: ${subscriptionError.message}`);
      throw new Error(`Error granting lifetime access: ${subscriptionError.message}`);
    }
    
    console.log(`Successfully granted lifetime access to user ${targetUserId}`);
    
    // Record the action in the payments table
    const { error: paymentError } = await supabaseClient
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
      });
    
    if (paymentError) {
      console.error(`Error recording payment: ${paymentError.message}`);
      // Don't throw here, just log the error since the subscription was already created
    }

    return new Response(
      JSON.stringify({ 
        message: 'Lifetime access granted successfully', 
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error(`Error in grant-lifetime-access function: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
