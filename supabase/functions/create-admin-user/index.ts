
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Get the Supabase URL and service role key from environment variables
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({
        error: "Missing environment variables for Supabase connection",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { email, password } = requestData;

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: email and password are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Creating admin user with email: ${email}`);

    // Create Supabase client with service role key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists by querying the user's email
    let existingUser = null;
    let userId = null;
    
    try {
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .limit(1);
        
      if (!userError && users && users.length > 0) {
        existingUser = users[0];
        userId = users[0].id;
        console.log("Found existing user:", userId);
      }
    } catch (err) {
      console.log("Error checking for existing user, will try to create new one:", err.message);
    }

    // If user doesn't exist, create a new one
    if (!existingUser) {
      console.log("User not found, creating new user");
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        throw createError;
      }

      userId = authData.user.id;
      console.log(`User created with ID: ${userId}`);
    } else {
      console.log("User already exists");
      
      // Update user password anyway to ensure it matches what was requested
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password }
      );
      
      if (updateError) {
        console.warn("Could not update password:", updateError.message);
      } else {
        console.log("User password updated successfully");
      }
    }

    // Make the user an admin by updating their profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      // Create a profile if it doesn't exist
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            is_admin: true,
            full_name: "Admin User",
          },
        ]);

      if (insertError) {
        throw insertError;
      }
      
      console.log("Created new admin profile");
    } else {
      // Update the existing profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }
      
      console.log("Updated existing profile to admin");
    }

    return new Response(
      JSON.stringify({
        message: "Admin user created/updated successfully",
        userId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating admin user:", error);

    return new Response(
      JSON.stringify({
        error: `Failed to create admin user: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
