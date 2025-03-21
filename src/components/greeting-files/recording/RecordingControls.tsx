
import { Button } from '@/components/ui/button';
import { Mic, Square, X } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => Promise<void> | void;
  onStopRecording: () => void;
  cancelRecording?: () => void;
  // Remove redundant props that do the same thing as onStartRecording/onStopRecording
}

export const RecordingControls = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  cancelRecording,
}: RecordingControlsProps) => {
  if (!isRecording) {
    return (
      <div className="flex justify-center gap-2">
        <Button 
          onClick={onStartRecording}
          className="bg-red-600 hover:bg-red-700"
        >
          <Mic className="h-4 w-4 mr-1" /> <span>Start Recording</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-2">
      <Button 
        onClick={onStopRecording}
        variant="outline"
      >
        <Square className="h-4 w-4 mr-1" /> <span>Stop Recording</span>
      </Button>
      {cancelRecording && (
        <Button 
          onClick={cancelRecording}
          variant="ghost"
        >
          <X className="h-4 w-4 mr-1" /> <span>Cancel</span>
        </Button>
      )}
    </div>
  );
};
