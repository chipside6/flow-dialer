
import { supabase } from '@/integrations/supabase/client';
import { logSupabaseOperation, OperationType } from '@/utils/supabaseDebug';

// Check if the voice-app-uploads bucket exists and has proper permissions
export async function ensureVoiceAppUploadsBucket() {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return false;
    }
    
    const voiceAppUploadsBucket = buckets?.find(bucket => bucket.name === 'voice-app-uploads');
    
    if (!voiceAppUploadsBucket) {
      console.log('Voice app uploads bucket does not exist. Please check SQL migrations.');
      return false;
    }
    
    // Verify bucket is public (optional, for debugging purposes)
    if (!voiceAppUploadsBucket.public) {
      console.warn('voice-app-uploads bucket exists but is not public - this might cause issues');
    }
    
    console.log('voice-app-uploads bucket exists and is properly configured');
    return true;
  } catch (error) {
    console.error('Error checking bucket existence:', error);
    return false;
  }
}

// Upload a greeting file to Supabase Storage with proper error handling and retry logic
export async function uploadGreetingFile(file: File, userId: string) {
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `greeting_${timestamp}.${fileExtension}`;
    const filePath = `${userId}/${filename}`;
    
    // Implement retry logic for upload
    let attempts = 0;
    const maxAttempts = 3;
    let uploadError = null;
    let data = null;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Upload attempt ${attempts} for file: ${filename}`);
      
      try {
        // Upload the file with upsert enabled
        const result = await supabase.storage
          .from('voice-app-uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (result.error) {
          uploadError = result.error;
          console.warn(`Upload attempt ${attempts} failed:`, result.error);
          
          // If it's not a connection issue, break immediately
          if (!result.error.message.includes('network') && 
              !result.error.message.includes('timeout')) {
            break;
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(r => setTimeout(r, 1000 * attempts));
        } else {
          data = result.data;
          uploadError = null;
          break; // Success, exit retry loop
        }
      } catch (e) {
        console.error(`Unexpected error in upload attempt ${attempts}:`, e);
        uploadError = e;
        // Wait before retry
        await new Promise(r => setTimeout(r, 1000 * attempts));
      }
    }
    
    if (uploadError) {
      console.error('All upload attempts failed:', uploadError);
      logSupabaseOperation({
        operation: OperationType.WRITE,
        table: 'storage.objects',
        user_id: userId,
        success: false,
        error: uploadError,
        auth_status: 'AUTHENTICATED'
      });
      throw uploadError;
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
