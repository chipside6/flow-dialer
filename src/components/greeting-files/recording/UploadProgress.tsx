
import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  isUploading: boolean;
  uploadProgress: number;
}

export const UploadProgress = ({ isUploading, uploadProgress }: UploadProgressProps) => {
  if (!isUploading && uploadProgress !== 100) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>{uploadProgress === 100 ? 'Upload complete!' : 'Uploading...'}</span>
        <span>{uploadProgress}%</span>
      </div>
      <Progress value={uploadProgress} className="h-2" />
    </div>
  );
};
