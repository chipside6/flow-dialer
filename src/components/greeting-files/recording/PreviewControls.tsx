
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

interface PreviewControlsProps {
  isUploading: boolean;
  isPreviewPlaying: boolean;
  togglePreview: () => void;
  handleUpload: () => void;
  cancelRecording: () => void;
}

export const PreviewControls = ({
  isUploading,
  isPreviewPlaying,
  togglePreview,
  handleUpload,
  cancelRecording,
}: PreviewControlsProps) => {
  return (
    <div className="flex justify-center gap-2">
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
    </div>
  );
};
