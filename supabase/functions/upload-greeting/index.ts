
import { serve } from "https://deno.land/std@0.184.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Path for storing audio files on the server
const SOUNDS_PATH = "/var/lib/asterisk/sounds/campaigns";

serve(async (req) => {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const campaignId = formData.get("campaignId") as string;
    
    if (!audioFile || !userId) {
      return new Response(
        JSON.stringify({ error: "Audio file and user ID are required" }),
        { headers, status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = new Date().getTime();
    const originalName = audioFile.name;
    const fileExtension = originalName.split(".").pop() || "wav";
    const safeFilename = originalName
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-z0-9]/gi, "_") // Replace non-alphanumeric chars
      .toLowerCase();
    
    const filename = `${safeFilename}_${timestamp}.${fileExtension}`;
    const filePath = `${userId}/${filename}`;
    
    // Upload to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("greetings")
      .upload(filePath, audioFile, {
        contentType: audioFile.type,
        upsert: true,
      });

    if (storageError) {
      return new Response(
        JSON.stringify({ error: "File upload failed", details: storageError }),
        { headers, status: 500 }
      );
    }
    
    // Get the public URL
    const { data: publicUrlData } = await supabase.storage
      .from("greetings")
      .getPublicUrl(filePath);
    
    const publicUrl = publicUrlData.publicUrl;
    
    // Save file reference in the database
    const { data: fileData, error: fileError } = await supabase
      .from("greeting_files")
      .insert({
        user_id: userId,
        filename: originalName,
        url: publicUrl,
        file_path: filePath,
        file_type: audioFile.type,
        file_size: audioFile.size
      })
      .select()
      .single();
      
    if (fileError) {
      return new Response(
        JSON.stringify({ error: "Failed to save file reference", details: fileError }),
        { headers, status: 500 }
      );
    }

    // If campaign ID is provided, update the campaign
    if (campaignId) {
      const { error: campaignError } = await supabase
        .from("campaigns")
        .update({
          greeting_file_url: publicUrl,
          greeting_file_name: originalName,
          audio_file_path: filePath
        })
        .eq("id", campaignId)
        .eq("user_id", userId);

      if (campaignError) {
        return new Response(
          JSON.stringify({ error: "Failed to update campaign", details: campaignError }),
          { headers, status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        file: fileData,
        url: publicUrl,
        message: "File uploaded successfully" 
      }),
      { headers, status: 200 }
    );
  } catch (error) {
    console.error("Error handling file upload:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers, status: 500 }
    );
  }
});
