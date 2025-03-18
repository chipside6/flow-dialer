
import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useUploadProgress } from '@/hooks/useUploadProgress';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Mic, Square, Upload } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';

interface RecordGreetingFormProps {
  userId: string | undefined;
}

export const RecordGreetingForm = ({ userId }: RecordGreetingFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const { uploadProgress, setUploadProgress } = useUploadProgress(isUploading);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const {
    isRecording,
    audioBlob,
    formattedDuration,
    startRecording,
    stopRecording,
    cancelRecording
  } = useAudioRecorder();

  // Create a temporary object URL for preview
  const handleCreatePreview = () => {
    if (audioBlob) {
      // Revoke old URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Create new URL
      const url = URL.createObjectURL(audioBlob);
      setPreviewUrl(url);
      
      // Create audio element for preview
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(url);
        previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
      } else {
        previewAudioRef.current.src = url;
      }
    }
  };

  // Toggle preview playback
  const togglePreview = () => {
    if (!previewAudioRef.current || !previewUrl) return;
    
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.play()
        .then(() => setIsPreviewPlaying(true))
        .catch(error => {
          console.error('Preview playback error:', error);
          toast({
            title: 'Playback error',
            description: 'Could not play the recording. Please try again.',
            variant: 'destructive',
          });
        });
    }
  };

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
      
      const result = await response.json();
      
      // Refresh the greeting files list
      queryClient.invalidateQueries({ queryKey: ['greetingFiles'] });
      
      toast({
        title: 'Recording uploaded',
        description: 'Your greeting recording has been uploaded successfully.',
      });
      
      // Reset the state
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    }
  };

  // Cleanup function to revoke object URL
  useState(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  });

  // Create preview when audio blob is available
  useState(() => {
    if (audioBlob && !previewUrl) {
      handleCreatePreview();
    }
  });

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

        {previewUrl && (
          <div className="my-4">
            <AudioWaveform 
              audioUrl={previewUrl} 
              isPlaying={isPreviewPlaying}
            />
          </div>
        )}

        <div className="flex justify-center gap-2">
          {!isRecording && !audioBlob && (
            <Button 
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <Button 
                onClick={stopRecording}
                variant="outline"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
              <Button 
                onClick={cancelRecording}
                variant="ghost"
              >
                Cancel
              </Button>
            </>
          )}

          {audioBlob && !isRecording && (
            <>
              <Button
                onClick={togglePreview}
                variant="secondary"
              >
                {isPreviewPlaying ? 'Pause' : 'Play'} Preview
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Recording
                  </>
                )}
              </Button>
              <Button 
                onClick={cancelRecording}
                variant="ghost"
              >
                Discard
              </Button>
            </>
          )}
        </div>

        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
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
