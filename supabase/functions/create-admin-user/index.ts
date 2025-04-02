
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
    // Create a Supabase client with the Auth admin API
    const supabaseAdmin = createClient(
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
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Creating admin user with email: ${email}`);
    
    // Create or update the user
    let userId;
    
    // Check if user exists by email
    const { data: existingUsers, error: findError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1);
      
    if (findError) {
      throw new Error(`Error looking up user by email: ${findError.message}`);
    }
    
    if (existingUsers && existingUsers.length > 0) {
      // User exists, update password
      userId = existingUsers[0].id;
      console.log(`Found existing user with ID: ${userId}`);
      
      try {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password }
        );
        
        if (updateError) {
          throw new Error(`Error updating user password: ${updateError.message}`);
        }
        
        console.log(`Updated password for user ID: ${userId}`);
      } catch (err) {
        console.error(`Failed to update password: ${err.message}`);
        throw err;
      }
    } else {
      // User doesn't exist, create new user
      console.log(`Creating new user with email: ${email}`);
      
      try {
        const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm the email
        });
        
        if (createError) {
          throw new Error(`Error creating user: ${createError.message}`);
        }
        
        userId = data.user.id;
        console.log(`Created new user with ID: ${userId}`);
      } catch (err) {
        console.error(`Failed to create user: ${err.message}`);
        throw err;
      }
    }
    
    // Make this user an admin in the profiles table
    console.log(`Setting is_admin=true for user: ${userId}`);
    
    try {
      // First check if profile exists
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, is_admin')
        .eq('id', userId)
        .single();
        
      if (existingProfile) {
        // Update existing profile to ensure is_admin is true
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ is_admin: true, email })
          .eq('id', userId);
          
        if (updateError) {
          throw new Error(`Error updating profile: ${updateError.message}`);
        }
        
        console.log(`Updated profile for user ${userId}, set is_admin=true`);
      } else {
        // Create new profile with is_admin=true
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({ id: userId, is_admin: true, email });
          
        if (insertError) {
          throw new Error(`Error creating profile: ${insertError.message}`);
        }
        
        console.log(`Created profile for user ${userId} with is_admin=true`);
      }
    } catch (profileError) {
      console.error(`Profile operation failed: ${profileError.message}`);
      throw profileError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created/updated successfully', 
        userId,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error(`Error in create-admin-user function: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
