
import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useUploadProgress } from '@/hooks/useUploadProgress';
import { AudioWaveform } from './AudioWaveform';
import { RecordingControls } from './recording/RecordingControls';
import { PreviewControls } from './recording/PreviewControls';
import { RecordingStatus } from './recording/RecordingStatus';
import { RecordingTips } from './recording/RecordingTips';
import { UploadProgress } from './recording/UploadProgress';
import { uploadRecording } from './recording/recorderService';

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
      await uploadRecording(audioBlob, userId);
      
      // Set progress to 100% when upload completes
      setUploadProgress(100);
      
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
      // Longer delay before resetting upload state to ensure 100% is shown
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    }
  };

  // Cleanup function to revoke object URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Create preview when audio blob is available
  useEffect(() => {
    if (audioBlob && !previewUrl) {
      handleCreatePreview();
    }
  }, [audioBlob, previewUrl]);

  return (
    <div className="space-y-6">
      <div className="p-4 border border-dashed border-gray-300 bg-gray-50 rounded-md">
        <div className="text-center mb-4">
          <RecordingStatus 
            isRecording={isRecording} 
            formattedDuration={formattedDuration} 
            hasRecording={!!audioBlob} 
          />
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
            <RecordingControls
              isRecording={false}
              startRecording={startRecording}
              stopRecording={stopRecording}
              cancelRecording={cancelRecording}
            />
          )}

          {isRecording && (
            <RecordingControls
              isRecording={true}
              startRecording={startRecording}
              stopRecording={stopRecording}
              cancelRecording={cancelRecording}
            />
          )}

          {audioBlob && !isRecording && (
            <PreviewControls
              isUploading={isUploading}
              isPreviewPlaying={isPreviewPlaying}
              togglePreview={togglePreview}
              handleUpload={handleUpload}
              cancelRecording={cancelRecording}
            />
          )}
        </div>

        <UploadProgress 
          isUploading={isUploading} 
          uploadProgress={uploadProgress}
        />
      </div>
      
      <RecordingTips />
    </div>
  );
};
