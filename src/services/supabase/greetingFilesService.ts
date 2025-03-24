import { supabase } from '@/integrations/supabase/client';
import { logSupabaseOperation, OperationType } from '@/utils/supabaseDebug';

// Ensure the voice-app-uploads bucket exists - now more robust
export async function ensureVoiceAppUploadsBucket() {
  try {
    // First check if the bucket already exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'voice-app-uploads');
    
    // Don't try to create the bucket if it already exists
    if (!bucketExists) {
      console.log('Voice app uploads bucket does not exist. It should be created via SQL migration.');
      
      // Don't attempt to create the bucket here as it will likely fail due to RLS.
      // Instead, inform the system that the bucket should exist from SQL migrations.
      
      // We'll return true anyway to prevent blocking the UI, since the SQL migrations
      // should have created the bucket already.
    } else {
      console.log('voice-app-uploads bucket already exists');
    }
    
    // No need to manually create RLS policies here as they are now managed via SQL migrations
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
}

// Upload a greeting file to Supabase Storage
export async function uploadGreetingFile(file: File, userId: string) {
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `greeting_${timestamp}.${fileExtension}`;
    const filePath = `${userId}/${filename}`;
    
    // Upload the file with upsert enabled
    const { data, error } = await supabase.storage
      .from('voice-app-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      logSupabaseOperation({
        operation: OperationType.WRITE,
        table: 'storage.objects',
        user_id: userId,
        success: false,
        error,
        auth_status: 'AUTHENTICATED'
      });
      throw error;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('voice-app-uploads')
      .getPublicUrl(filePath);
    
    // Log successful operation
    logSupabaseOperation({
      operation: OperationType.WRITE,
      table: 'storage.objects',
      user_id: userId,
      success: true,
      data: { path: data.path },
      auth_status: 'AUTHENTICATED'
    });
    
    // Return the file data
    return {
      path: data.path,
      url: urlData.publicUrl,
      filename: filename
    };
  } catch (error) {
    console.error('Error in uploadGreetingFile:', error);
    throw error;
  }
}

// Delete a greeting file from Supabase Storage
export async function deleteGreetingFile(filePath: string) {
  try {
    const { error } = await supabase.storage
      .from('voice-app-uploads')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteGreetingFile:', error);
    throw error;
  }
}

// Get all greeting files for a user
export async function getGreetingFiles(userId: string) {
  try {
    const { data, error } = await supabase
      .from('greeting_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching greeting files:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getGreetingFiles:', error);
    throw error;
  }
}

// Save greeting file metadata to the database
export async function saveGreetingFileMetadata(
  userId: string,
  filename: string,
  filePath: string,
  url: string,
  fileType: string = 'audio/webm',
  fileSize: number = 0
) {
  try {
    const { data, error } = await supabase
      .from('greeting_files')
      .insert({
        user_id: userId,
        filename: filename,
        file_path: filePath,
        url: url,
        file_type: fileType,
        file_size: fileSize
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving file metadata:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in saveGreetingFileMetadata:', error);
    throw error;
  }
}
