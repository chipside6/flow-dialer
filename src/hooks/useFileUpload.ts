
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useUploadProgress } from '@/hooks/useUploadProgress';

export function useFileUpload(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const { uploadProgress, setUploadProgress } = useUploadProgress(isUploading);
  const [file, setFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if it's an audio file
      if (!selectedFile.type.startsWith('audio/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an audio file (wav, mp3, etc.)',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !userId) return;
    
    setIsUploading(true);
    
    try {
      // Create form data for the Edge Function
      const formData = new FormData();
      formData.append('file', file);
      
      // Get the token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Call the Edge Function to upload the file
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-greeting`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );
      
      // Set progress to 100% when upload completes
      setUploadProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const result = await response.json();
      
      // Refresh the greeting files list
      queryClient.invalidateQueries({ queryKey: ['greetingFiles'] });
      
      toast({
        title: 'File uploaded',
        description: 'Your greeting file has been uploaded successfully.',
      });
      
      // Reset the file input
      setFile(null);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      // Short delay before resetting upload state (not the progress)
      // to make sure the 100% progress is shown
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
      
      // Reset the file input element
      const fileInput = document.getElementById('greeting-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  return {
    file,
    isUploading,
    uploadProgress,
    handleFileChange,
    handleUpload
  };
}
