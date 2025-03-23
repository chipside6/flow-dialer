
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all greeting files for a specific user
 */
export const fetchGreetingFiles = async (userId: string) => {
  console.log(`[GreetingFilesService] Fetching greeting files for user: ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('greeting_files')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[GreetingFilesService] Error in fetchGreetingFiles:`, error);
      throw error;
    }
    
    console.log(`[GreetingFilesService] Fetched ${data.length} greeting files successfully`);
    
    return data;
  } catch (error) {
    console.error(`[GreetingFilesService] Error in fetchGreetingFiles:`, error);
    throw error;
  }
};

/**
 * Uploads a new greeting file
 */
export const uploadGreetingFile = async (audioBlob: Blob, userId: string) => {
  console.log(`[GreetingFilesService] Uploading greeting file for user: ${userId}`);
  
  try {
    // Generate a timestamp for unique filename
    const timestamp = Date.now();
    const filename = `greeting_${timestamp}.webm`;
    const filePath = `${userId}/${filename}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-app-uploads')
      .upload(filePath, audioBlob, {
        contentType: 'audio/webm',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error(`[GreetingFilesService] Error uploading file:`, uploadError);
      throw uploadError;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('voice-app-uploads')
      .getPublicUrl(filePath);
    
    // Insert record in database
    const { data: fileData, error: insertError } = await supabase
      .from('greeting_files')
      .insert({
        user_id: userId,
        filename: filename,
        url: urlData.publicUrl
      })
      .select()
      .single();
    
    if (insertError) {
      console.error(`[GreetingFilesService] Error saving file record:`, insertError);
      throw insertError;
    }
    
    console.log(`[GreetingFilesService] Successfully uploaded greeting file:`, fileData);
    
    return { success: true, url: fileData.url };
  } catch (error) {
    console.error(`[GreetingFilesService] Error in uploadGreetingFile:`, error);
    throw error;
  }
};
