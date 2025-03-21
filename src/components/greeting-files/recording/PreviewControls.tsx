
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Play, Pause, X } from 'lucide-react';
import { useState } from 'react';

interface PreviewControlsProps {
  audioUrl: string;
  onReset: () => void;
  isUploading?: boolean;
  isPreviewPlaying?: boolean;
  togglePreview?: () => void;
  handleUpload?: () => void;
  cancelRecording?: () => void;
}

export const PreviewControls = ({
  audioUrl,
  onReset,
  isUploading = false,
  isPreviewPlaying = false,
  togglePreview,
  handleUpload,
  cancelRecording,
}: PreviewControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(isPreviewPlaying);
  const [audio] = useState(new Audio(audioUrl));
  
  const toggleAudio = () => {
    if (togglePreview) {
      togglePreview();
      return;
    }
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex justify-center gap-2">
      <Button
        onClick={toggleAudio}
        variant="secondary"
      >
        {isPlaying ? (
          <><Pause className="h-4 w-4 mr-1" /> <span>Pause</span></>
        ) : (
          <><Play className="h-4 w-4 mr-1" /> <span>Play</span></>
        )}
      </Button>
      
      {handleUpload && (
        <Button 
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" /> <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" /> <span>Upload</span>
            </>
          )}
        </Button>
      )}
      
      <Button 
        onClick={cancelRecording || onReset}
        variant="ghost"
      >
        <X className="h-4 w-4 mr-1" /> <span>Discard</span>
      </Button>
    </div>
  );
};
