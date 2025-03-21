
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { RecordingControls } from './recording/RecordingControls';
import { PreviewControls } from './recording/PreviewControls';
import { RecordingStatus } from './recording/RecordingStatus';
import { RecordingTips } from './recording/RecordingTips';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { uploadRecording } from './recording/recorderService';
import { UploadProgress } from './recording/UploadProgress';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface RecordGreetingFormProps {
  userId: string | undefined;
}

export const RecordGreetingForm = ({ userId }: RecordGreetingFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  
  const {
    audioBlob,
    audioUrl,
    isRecording,
    recordingDuration,
    formattedDuration,
    startRecording,
    stopRecording,
    resetRecording,
    recordingStatus,
    error: recordingError,
  } = useAudioRecorder();

  useEffect(() => {
    if (recordingError) {
      toast({
        title: 'Recording error',
        description: recordingError.message,
        variant: 'destructive',
      });
    }
  }, [recordingError, toast]);

  useEffect(() => {
    // Clean up audio on unmount
    return () => {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
      }
    };
  }, [previewAudio]);

  const togglePreview = () => {
    if (!audioUrl) return;

    if (!previewAudio) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPreviewPlaying(false);
      setPreviewAudio(audio);
      audio.play();
      setIsPreviewPlaying(true);
    } else {
      if (isPreviewPlaying) {
        previewAudio.pause();
        setIsPreviewPlaying(false);
      } else {
        previewAudio.play();
        setIsPreviewPlaying(true);
      }
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob || !userId) {
      toast({
        title: 'Error',
        description: 'No recording available or user not authenticated',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Upload recording to Supabase
      console.log("Starting upload of recording, blob size:", audioBlob.size);
      await uploadRecording(audioBlob, userId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Refetch greeting files after upload
      queryClient.invalidateQueries({ queryKey: ['greetingFiles', userId] });
      
      toast({
        title: 'Recording uploaded',
        description: 'Your recorded greeting has been uploaded successfully.',
      });
      
      // Reset the form after a short delay to show 100% progress
      setTimeout(() => {
        resetRecording();
        setIsUploading(false);
        setUploadProgress(0);
      }, 1500);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload recording');
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload recording',
        variant: 'destructive',
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Only show tips when not recording and no audio blob exists */}
      {!isRecording && !audioBlob && <RecordingTips />}
      
      {/* Show recording status when recording */}
      {isRecording && (
        <RecordingStatus 
          status={recordingStatus} 
          time={formattedDuration()} 
          isRecording={isRecording}
        />
      )}
      
      {/* Show controls for recording or previewing */}
      {audioBlob && audioUrl ? (
        <PreviewControls 
          audioUrl={audioUrl} 
          onReset={resetRecording}
          isPreviewPlaying={isPreviewPlaying}
          togglePreview={togglePreview}
          handleUpload={handleSubmit}
          isUploading={isUploading}
        />
      ) : (
        <RecordingControls 
          isRecording={isRecording}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />
      )}
      
      {/* Show upload button when audio is recorded */}
      {audioBlob && !isUploading && !audioUrl && (
        <Button 
          onClick={handleSubmit} 
          className="w-full mt-4"
        >
          Save Recording
        </Button>
      )}
      
      {/* Show uploading state */}
      {isUploading && (
        <Button disabled className="w-full mt-4">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </Button>
      )}
      
      {/* Show upload progress */}
      <UploadProgress 
        isUploading={isUploading} 
        uploadProgress={uploadProgress}
        error={uploadError}
      />
    </div>
  );
};
