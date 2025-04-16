
import { Progress } from '@/components/ui/progress';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface UploadProgressProps {
  isUploading: boolean;
  uploadProgress: number;
  error?: string | null;
  onRetry?: () => void;
}

export const UploadProgress = ({ 
  isUploading, 
  uploadProgress, 
  error,
  onRetry
}: UploadProgressProps) => {
  const [showLoader, setShowLoader] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  const [lastProgress, setLastProgress] = useState(0);
  const [stuckTime, setStuckTime] = useState(0);
  
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
  
  // More aggressive detection of stuck uploads
  useEffect(() => {
    // Reset stuck detection when progress changes
    if (uploadProgress !== lastProgress) {
      setLastProgress(uploadProgress);
      setStuckTime(0);
      setIsStuck(false);
      return;
    }
    
    // Check if we're in the middle of an upload
    if (isUploading && uploadProgress > 0 && uploadProgress < 100) {
      // Check every second if progress has stalled
      const interval = setInterval(() => {
        setStuckTime(prev => prev + 1);
        // Consider it stuck after 5 seconds with no progress
        if (stuckTime >= 5) {
          setIsStuck(true);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isUploading, uploadProgress, lastProgress, stuckTime]);
  
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
    statusText = 'Upload may be stuck.';
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
      
      {isStuck && onRetry && (
        <div className="flex justify-center mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="flex items-center text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry Upload
          </Button>
        </div>
      )}
    </div>
  );
};
