
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
    console.log("Creating admin user function started");
    
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
      console.log("Admin user already exists, using existing user");
      userId = existingUser.id;
      
      console.log("Existing user details:", {
        id: existingUser.id,
        email: existingUser.email,
        created_at: existingUser.created_at
      });
      
      // Try to update password for existing user
      try {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password }
        );
        
        if (updateError) {
          console.error("Error updating existing user password:", updateError);
        } else {
          console.log("Updated password for existing user");
        }
      } catch (passwordUpdateError) {
        console.error("Exception updating password:", passwordUpdateError);
      }
      
    } else {
      // Create the new user
      console.log("No existing admin user found, creating new one");
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        console.error("Error creating admin user:", createError);
        throw createError;
      }
      
      console.log("Admin user created successfully:", newUser.user.id);
      userId = newUser.user.id;
    }

    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
      console.error("Error checking existing profile:", profileCheckError);
    } else {
      console.log("Existing profile check result:", existingProfile);
    }
    
    // Set profile data and ensure we have the email field populated
    const profileData = { 
      id: userId, 
      is_affiliate: true, 
      is_admin: true,
      full_name: 'Admin User',
      email: email,
      updated_at: new Date().toISOString()
    };
    
    console.log("Updating profile with data:", profileData);
    
    // Update or create the profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        returning: 'representation'
      });

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }
    
    console.log("Admin user profile updated successfully:", updatedProfile);

    // Double-check the profiles table to verify data was properly saved
    const { data: verifyProfile, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (verifyError) {
      console.error("Error verifying profile update:", verifyError);
    } else {
      console.log("Verification of profile update:", verifyProfile);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin user created/updated successfully",
        userId: userId,
        profile: updatedProfile
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
        error: error.message,
        stack: error.stack
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
