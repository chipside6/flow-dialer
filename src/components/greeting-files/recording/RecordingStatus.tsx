
interface RecordingStatusProps {
  status: string;
  time: string;
  isRecording?: boolean;
  hasRecording?: boolean;
  formattedDuration?: () => string;
}

export const RecordingStatus = ({
  status,
  time,
  isRecording,
  hasRecording,
  formattedDuration,
}: RecordingStatusProps) => {
  if (isRecording) {
    return (
      <div className="text-destructive font-medium animate-pulse">
        Recording in progress... {formattedDuration?.() || time}
      </div>
    );
  }

  if (hasRecording) {
    return (
      <div className="text-green-600 font-medium">
        Recording complete! {formattedDuration?.() || time}
      </div>
    );
  }

  return (
    <div className="text-muted-foreground">
      {status === 'recording' ? `Recording... ${time}` : 'Click "Start Recording" to begin'}
    </div>
  );
};
