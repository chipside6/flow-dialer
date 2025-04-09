
import { supabase } from '@/integrations/supabase/client';

interface UploadAudioParams {
  file: File;
  userId: string;
  campaignId?: string;
}

interface AudioUploadResult {
  success: boolean;
  fileId?: string;
  url?: string;
  error?: string;
}

/**
 * Service for managing audio file uploads for campaigns
 */
export const audioUploadService = {
  /**
   * Upload an audio file for a campaign
   */
  async uploadAudio({ file, userId, campaignId }: UploadAudioParams): Promise<AudioUploadResult> {
    try {
      // Validate file type
      const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/x-wav'];
      if (!allowedTypes.includes(file.type)) {
        return { 
          success: false, 
          error: 'Invalid file type. Please upload a WAV or MP3 file.' 
        };
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return { 
          success: false, 
          error: 'File is too large. Maximum size is 10MB.' 
        };
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      if (campaignId) {
        formData.append('campaignId', campaignId);
      }
      
      // Upload using edge function
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/upload-greeting`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || `Error uploading file: ${response.status}` 
        };
      }
      
      const data = await response.json();
      
      return { 
        success: true, 
        fileId: data.file?.id,
        url: data.url
      };
    } catch (error) {
      console.error('Error uploading audio file:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error uploading audio file' 
      };
    }
  }
};
