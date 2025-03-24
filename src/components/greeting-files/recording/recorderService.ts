
import { supabase } from '@/integrations/supabase/client';
import { logSupabaseOperation, OperationType } from '@/utils/supabaseDebug';

export const uploadRecording = async (blob: Blob, userId: string): Promise<any> => {
  try {
    // Check if there's a Blob to upload
    if (!blob || blob.size === 0) {
      throw new Error('No recording available to upload');
    }

    // Generate a filename
    const timestamp = Date.now();
    const filename = `recording_${timestamp}.webm`;
    const filePath = `${userId}/${filename}`;

    console.log(`Uploading recording to: ${filePath}, size: ${blob.size} bytes`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('voice-app-uploads')
      .upload(filePath, blob, {
        contentType: 'audio/webm',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading recording:', error);
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

    console.log('Recording uploaded successfully:', data?.path);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('voice-app-uploads')
      .getPublicUrl(filePath);

    // Insert a record in the greeting_files table
    const { data: fileData, error: insertError } = await supabase
      .from('greeting_files')
      .insert({
        user_id: userId,
        filename: filename,
        url: urlData.publicUrl,
        file_path: filePath,
        file_type: 'audio/webm',
        file_size: blob.size
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving file record:', insertError);
      logSupabaseOperation({
        operation: OperationType.WRITE,
        table: 'greeting_files',
        user_id: userId,
        success: false,
        error: insertError,
        auth_status: 'AUTHENTICATED'
      });
      throw insertError;
    }

    // Log successful operation
    logSupabaseOperation({
      operation: OperationType.WRITE,
      table: 'greeting_files',
      user_id: userId,
      success: true,
      data: fileData,
      auth_status: 'AUTHENTICATED'
    });

    console.log('Greeting file record created:', fileData?.id);
    return fileData;
  } catch (error) {
    console.error('Upload recording error:', error);
    throw error;
  }
};
