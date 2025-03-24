
import { useState, useEffect } from 'react';

export function useUploadProgress(isUploading: boolean) {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  useEffect(() => {
    let interval: number | null = null;
    
    // When upload completes or is cancelled, handle cleanup
    if (!isUploading && uploadProgress !== 100) {
      setUploadProgress(0);
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
