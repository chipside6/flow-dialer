
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
    
    let userId;

    try {
      // First check if user exists using auth.admin.listUsers()
      console.log("Fetching users list to check if user exists");
      const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error("Error listing users:", listError);
        throw new Error(`Error listing users: ${listError.message}`);
      }
      
      const existingUser = data?.users?.find(u => u.email === email);
      
      if (existingUser) {
        // User exists, update password
        console.log(`User ${email} already exists with ID: ${existingUser.id}, updating password`);
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password }
        );
        
        if (updateError) {
          console.error("Error updating user:", updateError);
          throw new Error(`Error updating user: ${updateError.message}`);
        }
        
        userId = existingUser.id;
        console.log(`Updated user password successfully for ID: ${userId}`);
      } else {
        // User doesn't exist, create new user
        console.log(`User ${email} doesn't exist, creating new user`);
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        
        if (createError) {
          console.error("Error creating user:", createError);
          throw new Error(`Error creating user: ${createError.message}`);
        }
        
        if (!createData.user) {
          throw new Error("User creation succeeded but no user data returned");
        }
        
        userId = createData.user.id;
        console.log(`Created new user successfully with ID: ${userId}`);
      }
    } catch (authError) {
      console.error("Authentication operation failed:", authError);
      throw authError;
    }

    if (!userId) {
      console.error("No user ID available after auth operation");
      throw new Error('Failed to create or update user: No user ID available');
    }

    // Update the user's profile to make them an admin
    try {
      console.log(`Updating profile for user ID: ${userId} to make them admin`);
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ 
          id: userId, 
          is_admin: true
        });

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw new Error(`Error updating profile: ${profileError.message}`);
      }
      
      console.log(`Successfully updated profile for user ID: ${userId}`);
    } catch (profileError) {
      console.error("Profile update operation failed:", profileError);
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
