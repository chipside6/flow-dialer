
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [showLoader, setShowLoader] = useState(false);
  
  // Only show the loader after a brief delay to prevent flashing for quick uploads
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isUploading) {
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, 300);
    } else {
      setShowLoader(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isUploading]);
  
  // Don't show anything if not uploading and no progress or error
  if (!showLoader && uploadProgress === 0 && !error) {
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
