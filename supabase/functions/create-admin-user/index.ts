
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
    console.log("Create admin user function called");
    
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
      console.error("Email and password are required");
      return new Response(
        JSON.stringify({ error: 'Email and password are required', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Creating admin user with email: ${email}`);
    
    // Check if user exists by email
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    let userId;
    
    if (getUserError || !existingUser) {
      console.log(`No existing user found with email: ${email}, creating new user`);
      
      // User doesn't exist, create new user
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
      });
      
      if (createError) {
        console.error(`Error creating user: ${createError.message}`);
        throw new Error(`Error creating user: ${createError.message}`);
      }
      
      userId = data.user.id;
      console.log(`Created new user with ID: ${userId}`);
    } else {
      // User exists, update password
      userId = existingUser.user.id;
      console.log(`User exists with ID: ${userId} - updating password`);
      
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password }
      );
      
      if (updateError) {
        console.error(`Error updating user password: ${updateError.message}`);
        throw new Error(`Error updating user password: ${updateError.message}`);
      }
      
      console.log(`Updated password for user ID: ${userId}`);
    }
    
    // Check if profile exists
    const { data: existingProfile, error: checkProfileError } = await supabaseAdmin
      .from('profiles')
      .select('id, is_admin')
      .eq('id', userId)
      .single();
      
    if (checkProfileError && !checkProfileError.message.includes('No rows found')) {
      console.error(`Error checking profile: ${checkProfileError.message}`);
      throw new Error(`Error checking profile: ${checkProfileError.message}`);
    }
      
    if (existingProfile) {
      console.log(`Profile exists for user ${userId} - updating is_admin flag`);
      // Update existing profile to ensure is_admin is true
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId);
        
      if (updateError) {
        console.error(`Error updating profile: ${updateError.message}`);
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      console.log(`Updated profile for user ${userId}, set is_admin=true`);
    } else {
      console.log(`No profile exists for user ${userId} - creating new profile`);
      // Create new profile with is_admin=true
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({ id: userId, is_admin: true });
        
      if (insertError) {
        console.error(`Error creating profile: ${insertError.message}`);
        throw new Error(`Error creating profile: ${insertError.message}`);
      }
      
      console.log(`Created profile for user ${userId} with is_admin=true`);
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
