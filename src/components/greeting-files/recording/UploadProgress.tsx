
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';

interface UploadProgressProps {
  isUploading: boolean;
  uploadProgress: number;
  error?: string | null;
}

export const UploadProgress = ({ 
  isUploading, 
  uploadProgress, 
  error 
}: UploadProgressProps) => {
  if (!isUploading && uploadProgress === 0 && !error) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        {error ? (
          <span className="text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Upload failed: {error}
          </span>
        ) : (
          <>
            <span>{uploadProgress === 100 && !isUploading ? 'Upload complete!' : 'Uploading...'}</span>
            <span>{uploadProgress}%</span>
          </>
        )}
      </div>
      <Progress 
        value={error ? 100 : uploadProgress} 
        className={`h-2 ${error ? 'bg-destructive/20' : ''}`}
      />
    </div>
  );
};
