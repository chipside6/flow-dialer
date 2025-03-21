
import { supabase } from '@/integrations/supabase/client';

export async function uploadRecording(audioBlob: Blob, userId: string) {
  console.log("uploadRecording called with blob size:", audioBlob.size, "and userId:", userId);
  
  try {
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const filename = `recorded-greeting-${timestamp}.webm`;
    const filePath = `${userId}/${filename}`;
    
    console.log("Uploading to path:", filePath);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('greetings')
      .upload(filePath, audioBlob, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw error;
    }

    console.log("Upload successful, data:", data);
    
    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('greetings')
      .getPublicUrl(filePath);
    
    console.log("Public URL:", publicUrl);
    
    // Insert record into greeting_files table
    const { error: insertError } = await supabase
      .from('greeting_files')
      .insert({
        user_id: userId,
        filename: filename,
        url: publicUrl,
        // Estimate duration based on blob size if available
        duration_seconds: null,
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }
    
    console.log("File record inserted into database");
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload error in recorderService:', error);
    throw error;
  }
}
