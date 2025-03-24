
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Creates lifetime plan for a user
 */
export const createLifetimePlanForUser = async (userId: string) => {
  console.log(`[GreetingFilesService] Creating lifetime plan for user: ${userId}`);
  
  try {
    // Check if the subscription already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
      console.error(`[GreetingFilesService] Error checking subscription:`, checkError);
      return;
    }
    
    // If subscription already exists, don't create another one
    if (existingSubscription) {
      console.log(`[GreetingFilesService] User already has a subscription:`, existingSubscription);
      return;
    }
    
    console.log(`[GreetingFilesService] No existing subscription, creating lifetime plan...`);
    
    // Create a lifetime subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: 'lifetime',
        plan_name: 'Lifetime Plan',
        status: 'active',
        current_period_end: new Date(2099, 11, 31).toISOString(), // Far future date
      })
      .select()
      .single();
    
    if (error) {
      console.error(`[GreetingFilesService] Error creating lifetime plan:`, error);
      return;
    }
    
    console.log(`[GreetingFilesService] Successfully created lifetime plan:`, data);
  } catch (error) {
    console.error(`[GreetingFilesService] Error in createLifetimePlanForUser:`, error);
  }
};

/**
 * Ensures that the voice-app-uploads bucket exists
 */
export const ensureVoiceAppUploadsBucket = async (): Promise<boolean> => {
  console.log(`[GreetingFilesService] Ensuring voice-app-uploads bucket exists`);
  
  try {
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error(`[GreetingFilesService] Error listing buckets:`, listError);
      return false;
    }
    
    const voiceAppBucket = buckets?.find(bucket => bucket.name === 'voice-app-uploads');
    
    // If bucket already exists, we're good
    if (voiceAppBucket) {
      console.log(`[GreetingFilesService] voice-app-uploads bucket already exists`);
      return true;
    }
    
    console.log(`[GreetingFilesService] Creating voice-app-uploads bucket...`);
    
    // Create the bucket if it doesn't exist
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('voice-app-uploads', {
      public: true
    });
    
    if (createError) {
      console.error(`[GreetingFilesService] Error creating bucket:`, createError);
      return false;
    }
    
    console.log(`[GreetingFilesService] Successfully created voice-app-uploads bucket:`, newBucket);
    return true;
  } catch (error) {
    console.error(`[GreetingFilesService] Error in ensureVoiceAppUploadsBucket:`, error);
    return false;
  }
};

/**
 * Fetches all greeting files for a specific user
 */
export const fetchGreetingFiles = async (userId: string) => {
  console.log(`[GreetingFilesService] Fetching greeting files for user: ${userId}`);
  
  try {
    // Ensure bucket exists
    await ensureVoiceAppUploadsBucket();
    
    const { data, error } = await supabase
      .from('greeting_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`[GreetingFilesService] Error in fetchGreetingFiles:`, error);
      throw error;
    }
    
    console.log(`[GreetingFilesService] Fetched ${data?.length || 0} greeting files successfully`);
    return data;
  } catch (error) {
    console.error(`[GreetingFilesService] Error in fetchGreetingFiles:`, error);
    toast({
      title: "Error fetching greeting files",
      description: error.message || "There was an error fetching your greeting files.",
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Uploads a greeting file for a specific user
 */
export const uploadGreetingFile = async (file: File, userId: string) => {
  console.log(`[GreetingFilesService] Uploading greeting file for user: ${userId}`);
  
  try {
    // Ensure bucket exists
    const bucketExists = await ensureVoiceAppUploadsBucket();
    if (!bucketExists) {
      throw new Error("Could not create storage bucket");
    }
    
    // Generate file path
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    
    console.log(`[GreetingFilesService] Uploading file to: ${filePath}`);
    
    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-app-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error(`[GreetingFilesService] Error uploading file:`, uploadError);
      throw uploadError;
    }
    
    console.log(`[GreetingFilesService] File uploaded successfully, getting public URL`);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('voice-app-uploads')
      .getPublicUrl(filePath);
    
    // Create record in greeting_files table
    const { data: fileData, error: insertError } = await supabase
      .from('greeting_files')
      .insert({
        user_id: userId,
        filename: file.name,
        url: urlData.publicUrl,
        file_path: filePath, // Make sure to store the file path
        file_type: file.type,
        file_size: file.size
      })
      .select()
      .single();
    
    if (insertError) {
      console.error(`[GreetingFilesService] Error creating file record:`, insertError);
      throw insertError;
    }
    
    console.log(`[GreetingFilesService] Greeting file record created:`, fileData);
    
    toast({
      title: "Greeting file uploaded",
      description: `"${file.name}" has been uploaded successfully.`
    });
    
    return fileData;
  } catch (error) {
    console.error(`[GreetingFilesService] Error in uploadGreetingFile:`, error);
    toast({
      title: "Error uploading greeting file",
      description: error.message || "There was an error uploading your greeting file.",
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Deletes a greeting file
 */
export const deleteGreetingFile = async (fileId: string, userId: string) => {
  console.log(`[GreetingFilesService] Deleting greeting file: ${fileId} for user: ${userId}`);
  
  try {
    // Get file path from database
    const { data: fileData, error: fileError } = await supabase
      .from('greeting_files')
      .select('file_path')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();
    
    if (fileError) {
      console.error(`[GreetingFilesService] Error getting file data:`, fileError);
      throw fileError;
    }
    
    // Now we can safely access file_path as it exists in the database
    if (fileData && fileData.file_path) {
      console.log(`[GreetingFilesService] Deleting file from storage: ${fileData.file_path}`);
      
      // Delete from Supabase storage
      const { error: storageError } = await supabase.storage
        .from('voice-app-uploads')
        .remove([fileData.file_path]);
      
      if (storageError) {
        console.error(`[GreetingFilesService] Error deleting file from storage:`, storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }
    
    // Delete record from database
    const { error: deleteError } = await supabase
      .from('greeting_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error(`[GreetingFilesService] Error deleting file record:`, deleteError);
      throw deleteError;
    }
    
    console.log(`[GreetingFilesService] Greeting file deleted successfully`);
    
    toast({
      title: "Greeting file deleted",
      description: "The greeting file has been deleted successfully."
    });
    
    return true;
  } catch (error) {
    console.error(`[GreetingFilesService] Error in deleteGreetingFile:`, error);
    toast({
      title: "Error deleting greeting file",
      description: error.message || "There was an error deleting your greeting file.",
      variant: "destructive"
    });
    throw error;
  }
};
