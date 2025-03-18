
import { Button } from '@/components/ui/button';
import { Mic, Square, Upload, Loader2 } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  audioBlob: Blob | null;
  isUploading: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
  handleUpload: () => void;
}

export const RecordingControls = ({
  isRecording,
  audioBlob,
  isUploading,
  startRecording,
  stopRecording,
  cancelRecording,
  handleUpload
}: RecordingControlsProps) => {
  return (
    <div className="flex justify-center gap-2 flex-wrap">
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
  );
};
