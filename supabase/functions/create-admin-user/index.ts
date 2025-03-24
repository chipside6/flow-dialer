
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Create authenticated Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    
    console.log("Creating admin user...");
    
    // Create or get admin user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: "admin@gmail.com",
      password: "test123",
      email_confirm: true,
      user_metadata: {
        full_name: "Admin User",
      }
    });
    
    if (userError) {
      // If user already exists, try to update instead
      if (userError.message.includes("already exists")) {
        console.log("Admin user already exists, finding user...");
        
        // Find the user by email
        const { data: { users }, error: findError } = await supabase.auth.admin.listUsers();
        
        if (findError) {
          throw findError;
        }
        
        const adminUser = users.find(u => u.email === "admin@gmail.com");
        
        if (!adminUser) {
          throw new Error("Could not find admin user");
        }
        
        console.log("Found admin user, updating profile...");
        
        // Update the profile to ensure admin privileges
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ is_admin: true })
          .eq("id", adminUser.id);
        
        if (updateError) {
          throw updateError;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Admin user updated successfully",
            user: { email: "admin@gmail.com" }
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      } else {
        throw userError;
      }
    }
    
    const userId = userData.user?.id;
    
    if (!userId) {
      throw new Error("User ID not returned from createUser");
    }
    
    console.log("Admin user created, updating profile with admin privileges...");
    
    // Update the profile to ensure admin privileges
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ is_admin: true })
      .eq("id", userId);
    
    if (profileError) {
      throw profileError;
    }
    
    console.log("Admin user created and profile updated successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin user created successfully",
        user: userData.user
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Error in create-admin-user function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: error.message || "Failed to create admin user" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
