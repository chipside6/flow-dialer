
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
    
    // Try to find if the user already exists
    const { data: existingUser, error: lookupError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (lookupError) {
      throw new Error(`Error checking existing users: ${lookupError.message}`);
    }
    
    // Check if user already exists by email
    const userExists = existingUser?.users.find(u => u.email === email);
    
    let userData;
    
    if (userExists) {
      // Update existing user
      console.log(`User ${email} already exists, updating...`);
      const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userExists.id,
        { password }
      );
      
      if (updateError) throw new Error(`Error updating user: ${updateError.message}`);
      userData = data;
    } else {
      // Create new user
      console.log(`Creating new user with email ${email}`);
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      
      if (createError) throw new Error(`Error creating user: ${createError.message}`);
      userData = data;
    }

    if (!userData?.user) {
      throw new Error('Failed to create or update user');
    }

    // Update the user's profile to make them an admin
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userData.user.id, 
        is_admin: true,
        full_name: 'Admin User'
      });

    if (updateProfileError) {
      throw new Error(`Error updating profile: ${updateProfileError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created/updated successfully', 
        userId: userData.user.id 
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
