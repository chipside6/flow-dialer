
import { useState, useEffect } from 'react';

export function useUploadProgress(isUploading: boolean) {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  useEffect(() => {
    let interval: number | null = null;
    
    if (isUploading) {
      setUploadProgress(10); // Start at 10%
      
      interval = window.setInterval(() => {
        setUploadProgress(prev => {
          // Increment progress but cap at 90% until actual upload completes
          return prev < 90 ? prev + 5 : prev;
        });
      }, 300);
    } else {
      setUploadProgress(0);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isUploading]);

  return {
    uploadProgress,
    setUploadProgress
  };
}
