
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
    
    let userData;
    let userId;

    try {
      // First try to get user by email to check if they exist
      const { data: userList, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (getUserError) {
        throw new Error(`Error fetching users: ${getUserError.message}`);
      }
      
      // Check if user exists in the list
      const existingUser = userList.users.find(u => u.email === email);
      
      if (existingUser) {
        // Update existing user's password
        console.log(`User ${email} already exists, updating password...`);
        const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password }
        );
        
        if (updateError) {
          throw new Error(`Error updating user: ${updateError.message}`);
        }
        
        userData = data;
        userId = existingUser.id;
      } else {
        // Create new user
        console.log(`Creating new user with email ${email}`);
        const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        
        if (createError) {
          throw new Error(`Error creating user: ${createError.message}`);
        }
        
        userData = data;
        userId = data.user.id;
      }
    } catch (authError) {
      console.error("Auth operation error:", authError.message);
      throw authError;
    }

    if (!userId) {
      throw new Error('Failed to create or update user: No user ID available');
    }

    // Update the user's profile to make them an admin
    try {
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ 
          id: userId, 
          is_admin: true
        });

      if (updateProfileError) {
        throw new Error(`Error updating profile: ${updateProfileError.message}`);
      }
    } catch (profileError) {
      console.error("Profile update error:", profileError.message);
      throw profileError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created/updated successfully', 
        userId: userId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error(`Error creating admin user: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
