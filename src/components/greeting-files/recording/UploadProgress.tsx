
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
      }, 100); // Reduced delay for better responsiveness
    } else if (!isUploading && uploadProgress !== 100) {
      setShowLoader(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isUploading, uploadProgress]);
  
  // Always show the progress if we're uploading or at 100%
  const shouldShow = showLoader || isUploading || uploadProgress === 100 || error;
  
  if (!shouldShow) {
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
