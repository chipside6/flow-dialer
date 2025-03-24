
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

  // Get authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "No authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Create authenticated Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { 
      auth: { 
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false 
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );

  try {
    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process the form data
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      console.error("No file uploaded or invalid file");
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing file upload: ${file.name} (${file.size} bytes)`);

    // Generate a unique filename to avoid collisions
    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}_${file.name}`;
    const filePath = `${user.id}/${uniqueFilename}`;
    
    console.log(`Uploading file to path: ${filePath}`);

    // Upload the file to storage
    const { data, error } = await supabase.storage
      .from('voice-app-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('voice-app-uploads')
      .getPublicUrl(filePath);

    console.log(`File uploaded successfully. Public URL: ${publicUrl}`);

    // Save the file metadata in the greeting_files table
    const { data: greetingFile, error: insertError } = await supabase
      .from('greeting_files')
      .insert({
        user_id: user.id,
        filename: file.name,
        url: publicUrl,
        file_path: filePath  // Now correctly saving the file path
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        file: greetingFile,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in upload-greeting function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
