
import { useState, useEffect } from 'react';

export function useUploadProgress(isUploading: boolean) {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  useEffect(() => {
    let interval: number | null = null;
    
    if (isUploading) {
      setUploadProgress(10); // Start at 10%
      
      interval = window.setInterval(() => {
        setUploadProgress(prev => {
          // Increment progress but cap at 95% until actual upload completes
          // Changed from 90% to 95% to show more progress
          return prev < 95 ? prev + 5 : prev;
        });
      }, 300);
    } else {
      // Only reset progress to 0 when upload is canceled or hasn't started
      // Don't reset when upload completes successfully
      if (uploadProgress !== 100) {
        setUploadProgress(0);
      }
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isUploading, uploadProgress]);

  return {
    uploadProgress,
    setUploadProgress
  };
}
