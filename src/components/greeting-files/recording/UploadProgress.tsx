
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
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  
  // Only show the loader after a brief delay to prevent flashing for quick uploads
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isUploading) {
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, 100);
    } else if (!isUploading && uploadProgress !== 100) {
      setShowLoader(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isUploading, uploadProgress]);
  
  // Smooth progress updates
  useEffect(() => {
    // If upload progress changes, animate to the new value
    if (displayProgress !== uploadProgress) {
      // For small increments, update immediately
      if (Math.abs(uploadProgress - displayProgress) < 5) {
        setDisplayProgress(uploadProgress);
      } else {
        // For larger jumps, animate the transition
        const step = uploadProgress > displayProgress ? 1 : -1;
        const timer = setTimeout(() => {
          setDisplayProgress(prev => prev + step);
        }, 20);
        
        return () => clearTimeout(timer);
      }
    }
  }, [uploadProgress, displayProgress]);
  
  // Detect stuck upload (no progress for 10 seconds while uploading)
  useEffect(() => {
    let stuckTimeout: NodeJS.Timeout;
    
    if (isUploading && uploadProgress > 0 && uploadProgress < 100) {
      stuckTimeout = setTimeout(() => {
        setIsStuck(true);
      }, 10000); // 10 seconds with no progress change
    } else {
      setIsStuck(false);
    }
    
    return () => {
      if (stuckTimeout) clearTimeout(stuckTimeout);
    };
  }, [isUploading, uploadProgress]);
  
  // Always show the progress if we're uploading or at 100%
  const shouldShow = showLoader || isUploading || uploadProgress === 100 || error || isStuck;
  
  if (!shouldShow) {
    return null;
  }

  // Calculate the status text
  let statusText = 'Uploading...';
  if (uploadProgress === 100 && !isUploading) {
    statusText = 'Upload complete!';
  } else if (isStuck) {
    statusText = 'Upload may be stuck. You can try again.';
  } else if (uploadProgress < 20) {
    statusText = 'Preparing upload...';
  } else if (uploadProgress < 80) {
    statusText = 'Uploading file...';
  } else if (uploadProgress < 100) {
    statusText = 'Processing file...';
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
            <span>{statusText}</span>
            <span>{displayProgress}%</span>
          </>
        )}
      </div>
      <Progress 
        value={error ? 100 : displayProgress} 
        className={`h-2 ${error ? 'bg-destructive/20' : isStuck ? 'bg-amber-200' : ''}`}
      />
    </div>
  );
};
