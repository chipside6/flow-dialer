
import { useState, useEffect } from 'react';

export function useUploadProgress(isUploading: boolean) {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Reset progress when upload status changes
  useEffect(() => {
    if (!isUploading && uploadProgress !== 100) {
      // Only reset if not showing completion (100%)
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
    
    return () => {
      // Clean up any pending timeouts
    };
  }, [isUploading, uploadProgress]);

  return {
    uploadProgress,
    setUploadProgress
  };
}
