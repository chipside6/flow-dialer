
import { RecordingStatusType } from '@/hooks/useAudioRecorder';

interface RecordingStatusProps {
  status?: RecordingStatusType;
  time?: string;
  isRecording?: boolean;
  hasRecording?: boolean;
  formattedDuration?: () => string;
}

export const RecordingStatus = ({
  status = 'idle',
  time = '00:00',
  isRecording = false,
  hasRecording = false,
  formattedDuration,
}: RecordingStatusProps) => {
  // Use isRecording prop as the primary indicator
  if (isRecording) {
    return (
      <div className="text-destructive font-medium animate-pulse">
        Recording in progress... {formattedDuration?.() || time}
      </div>
    );
  }

  // Use hasRecording as secondary indicator
  if (hasRecording) {
    return (
      <div className="text-green-600 font-medium">
        Recording complete! {formattedDuration?.() || time}
      </div>
    );
  }

  // Default state - show different messages based on status
  return (
    <div className="text-muted-foreground">
      {status === 'recording' 
        ? `Recording... ${time}` 
        : status === 'complete'
          ? `Recording ready. ${time}` 
          : 'Click "Start Recording" to begin'}
    </div>
  );
};
