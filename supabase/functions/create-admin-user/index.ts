
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Set up our admin user credentials
    const email = 'admin@gmail.com';
    const password = 'test123';

    console.log(`Creating admin user: ${email}`);

    // Check if the user already exists
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers();

    if (searchError) {
      console.error("Error searching for existing user:", searchError);
      throw searchError;
    }

    const existingUser = existingUsers?.users?.find(user => user.email === email);
    let userId;

    if (existingUser) {
      console.log("User already exists, updating affiliate status");
      userId = existingUser.id;
    } else {
      // Create the new user
      console.log("Creating new admin user");
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        console.error("Error creating admin user:", createError);
        throw createError;
      }
      
      console.log("Admin user created successfully");
      userId = newUser.user.id;
    }

    // Set the user as an affiliate and admin in the profiles table
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId, 
        is_affiliate: true, 
        is_admin: true,
        full_name: 'Admin User',
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }

    console.log("Admin user set as affiliate successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin user created/updated and set as affiliate" 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 400 
      }
    );
  }
});
