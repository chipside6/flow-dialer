
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
}

export const RecordingControls = ({
  isRecording,
  startRecording,
  stopRecording,
  cancelRecording,
}: RecordingControlsProps) => {
  if (!isRecording) {
    return (
      <div className="flex justify-center gap-2">
        <Button 
          onClick={startRecording}
          className="bg-red-600 hover:bg-red-700"
        >
          <Mic className="h-4 w-4 mr-2" />
          Start Recording
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-2">
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
    </div>
  );
};
