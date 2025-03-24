import { supabase } from '@/integrations/supabase/client';

// Ensure the voice-app-uploads bucket exists
export async function ensureVoiceAppUploadsBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'voice-app-uploads');
    
    if (!bucketExists) {
      console.log('Creating voice-app-uploads bucket');
      const { error } = await supabase.storage.createBucket('voice-app-uploads', {
        public: false
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        throw error;
      }
      
      console.log('voice-app-uploads bucket created successfully');
    } else {
      console.log('voice-app-uploads bucket already exists');
    }
    
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
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('voice-app-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('voice-app-uploads')
      .getPublicUrl(filePath);
    
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
