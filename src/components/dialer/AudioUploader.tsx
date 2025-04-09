
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Mic, Upload, X, Volume2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { audioUploadService } from '@/services/autodialer/audioUploadService';

interface AudioUploaderProps {
  campaignId: string;
  onSuccess?: (url: string) => void;
  currentAudioUrl?: string;
  disabled?: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  campaignId,
  onSuccess,
  currentAudioUrl,
  disabled = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | undefined>(currentAudioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.id) return;
    
    const file = files[0];
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Upload the file
      const result = await audioUploadService.uploadAudio({
        file,
        userId: user.id,
        campaignId
      });
      
      clearInterval(progressInterval);
      
      if (result.success && result.url) {
        setUploadProgress(100);
        setUploadedUrl(result.url);
        
        if (onSuccess) {
          onSuccess(result.url);
        }
        
        toast({
          title: 'Audio uploaded successfully',
          description: 'Your greeting audio has been uploaded and associated with this campaign.'
        });
      } else {
        setUploadProgress(0);
        toast({
          title: 'Upload failed',
          description: result.error || 'Failed to upload audio file.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      setUploadProgress(0);
      toast({
        title: 'Upload error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle clicking the upload button
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle audio playback
  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle audio playback ended
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  
  // Reset audio upload
  const handleReset = () => {
    setUploadedUrl(undefined);
    if (onSuccess) {
      onSuccess('');
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="audio/wav,audio/mpeg,audio/mp3,audio/x-wav"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />
      
      {uploadedUrl ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePlayAudio}
              disabled={disabled}
            >
              {isPlaying ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleReset}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
          
          <audio 
            ref={audioRef}
            src={uploadedUrl} 
            onEnded={handleAudioEnded}
            className="hidden"
          />
          
          <p className="text-xs text-muted-foreground">
            Audio has been uploaded and will be played to contacts when they answer.
          </p>
        </div>
      ) : (
        <div>
          {isUploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleUploadClick}
              className="w-full h-20 flex flex-col"
              disabled={disabled}
            >
              <Upload className="h-6 w-6 mb-1" />
              <span>Upload Greeting Audio</span>
              <span className="text-xs text-muted-foreground mt-1">WAV or MP3, max 10MB</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
