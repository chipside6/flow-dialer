
import { Button } from '@/components/ui/button';
import { Mic, Square, X } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => Promise<void> | void;
  onStopRecording: () => void;
  cancelRecording?: () => void;
  startRecording?: () => void;
  stopRecording?: () => void;
}

export const RecordingControls = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  cancelRecording,
  startRecording,
  stopRecording,
}: RecordingControlsProps) => {
  const handleStartRecording = () => {
    if (startRecording) {
      startRecording();
    } else {
      onStartRecording();
    }
  };

  const handleStopRecording = () => {
    if (stopRecording) {
      stopRecording();
    } else {
      onStopRecording();
    }
  };

  if (!isRecording) {
    return (
      <div className="flex justify-center gap-2">
        <Button 
          onClick={handleStartRecording}
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
        onClick={handleStopRecording}
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
