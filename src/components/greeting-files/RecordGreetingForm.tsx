
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useUploadProgress } from '@/hooks/useUploadProgress';
import { Progress } from '@/components/ui/progress';
import { PreviewPlayer } from './PreviewPlayer';
import { RecordingControls } from './RecordingControls';

interface RecordGreetingFormProps {
  userId: string | undefined;
}

export const RecordGreetingForm = ({ userId }: RecordGreetingFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const { uploadProgress, setUploadProgress } = useUploadProgress(isUploading);

  const {
    isRecording,
    audioBlob,
    formattedDuration,
    startRecording,
    stopRecording,
    cancelRecording
  } = useAudioRecorder();

  // Upload the recorded audio
  const handleUpload = async () => {
    if (!audioBlob || !userId) return;
    
    setIsUploading(true);
    
    try {
      // Create form data for the Edge Function
      const formData = new FormData();
      formData.append('file', audioBlob, 'recorded-greeting.webm');
      
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
      
      // Refresh the greeting files list
      queryClient.invalidateQueries({ queryKey: ['greetingFiles'] });
      
      toast({
        title: 'Recording uploaded',
        description: 'Your greeting recording has been uploaded successfully.',
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      // Longer delay before resetting upload state to ensure 100% is shown
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border border-dashed border-gray-300 bg-gray-50 rounded-md">
        <div className="text-center mb-4">
          {isRecording ? (
            <div className="text-destructive font-medium animate-pulse">
              Recording in progress... {formattedDuration()}
            </div>
          ) : audioBlob ? (
            <div className="text-green-600 font-medium">
              Recording complete! {formattedDuration()}
            </div>
          ) : (
            <div className="text-muted-foreground">
              Click "Start Recording" to begin
            </div>
          )}
        </div>

        <PreviewPlayer audioBlob={audioBlob} isUploading={isUploading} />

        <RecordingControls 
          isRecording={isRecording}
          audioBlob={audioBlob}
          isUploading={isUploading}
          startRecording={startRecording}
          stopRecording={stopRecording}
          cancelRecording={cancelRecording}
          handleUpload={handleUpload}
        />

        {(isUploading || uploadProgress === 100) && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{uploadProgress === 100 ? 'Upload complete!' : 'Uploading...'}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Recording tips:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Find a quiet place with minimal background noise</li>
          <li>Speak clearly at a consistent volume</li>
          <li>Keep your greeting brief and professional</li>
          <li>Test your microphone before recording your final version</li>
        </ul>
      </div>
    </div>
  );
};
