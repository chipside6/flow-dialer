
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
        JSON.stringify({ error: 'Email and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Creating admin user with email: ${email}`);
    
    // First, create or update the user
    let userId;
    try {
      // Try to get the existing user
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        throw new Error(`Error listing users: ${listError.message}`);
      }
      
      const existingUser = users?.users?.find(u => u.email === email);
      
      if (existingUser) {
        // User exists, update password
        console.log(`User exists: ${existingUser.id} - updating password`);
        
        const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password }
        );
        
        if (updateError) {
          throw new Error(`Error updating user: ${updateError.message}`);
        }
        
        userId = existingUser.id;
      } else {
        // User doesn't exist, create new user
        console.log(`Creating new user with email: ${email}`);
        
        const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        
        if (createError) {
          throw new Error(`Error creating user: ${createError.message}`);
        }
        
        userId = data.user.id;
      }
      
      console.log(`User id: ${userId}`);
    } catch (authError) {
      console.error(`Auth operation failed: ${authError.message}`);
      throw authError;
    }
    
    // Make this user an admin in the profiles table
    try {
      console.log(`Setting is_admin=true for user: ${userId}`);
      
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ 
          id: userId, 
          is_admin: true 
        });
      
      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
      
      console.log('Profile updated successfully');
    } catch (profileError) {
      console.error(`Profile update failed: ${profileError.message}`);
      throw profileError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created/updated successfully', 
        userId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error(`Error in create-admin-user function: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
