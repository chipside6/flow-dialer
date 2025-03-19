
interface RecordingStatusProps {
  isRecording: boolean;
  formattedDuration: () => string;
  hasRecording: boolean;
}

export const RecordingStatus = ({
  isRecording,
  formattedDuration,
  hasRecording,
}: RecordingStatusProps) => {
  if (isRecording) {
    return (
      <div className="text-destructive font-medium animate-pulse">
        Recording in progress... {formattedDuration()}
      </div>
    );
  }

  if (hasRecording) {
    return (
      <div className="text-green-600 font-medium">
        Recording complete! {formattedDuration()}
      </div>
    );
  }

  return (
    <div className="text-muted-foreground">
      Click "Start Recording" to begin
    </div>
  );
};
