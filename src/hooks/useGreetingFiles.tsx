
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { GreetingFile } from "./greeting-files/types";
import { useGreetingFilesQuery } from "./greeting-files/useGreetingFilesQuery";
import { useDeleteGreetingFile } from "./greeting-files/useDeleteGreetingFile";
import { useRefreshGreetingFiles } from "./greeting-files/useRefreshGreetingFiles";
import { useErrorHandling } from "./greeting-files/useErrorHandling";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

// Re-export the GreetingFile type for backward compatibility
export type { GreetingFile } from "./greeting-files/types";

export function useGreetingFiles() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the extracted hooks
  const { 
    data: greetingFiles = [], 
    error, 
    refetch,
    isLoading: isQueryLoading,
    isFetching,
    isError
  } = useGreetingFilesQuery(user?.id);
  
  // Handle errors
  useErrorHandling(error as Error | null);
  
  // Handle the delete operation - export the mutation result directly
  const deleteGreetingFile = useDeleteGreetingFile(user?.id);
  
  // Handle refreshing the files
  const { refreshGreetingFiles } = useRefreshGreetingFiles(user?.id);

  const forceRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await refetch();
    } catch (err) {
      console.error("Error forcing refresh:", err);
    }
  }, [refetch]);

  // Set up loading state management
  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout | undefined;
    
    if (isQueryLoading || isFetching) {
      setIsLoading(true);
      
      // Clear any previous timeout
      if (loadingTimeout) clearTimeout(loadingTimeout);
      
      // Set a reasonable timeout to prevent infinite loading states
      loadingTimeout = setTimeout(() => {
        // Only show toast if we're still loading after timeout
        if (isQueryLoading || isFetching) {
          toast({
            title: "Loading taking longer than expected",
            description: "We're having trouble loading your audio files. Please try again.",
            variant: "warning",
            action: (
              <ToastAction altText="Retry" onClick={forceRefresh}>
                Retry Loading
              </ToastAction>
            )
          });
        }
        setIsLoading(false);
      }, 8000); // Increased from 6000 to 8000ms to give more time
    } else {
      // When query is done, end loading state after a short delay
      // This ensures we have a minimum loading time for UI consistency
      setIsLoading(false);
    }
    
    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [isQueryLoading, isFetching, greetingFiles, forceRefresh]);

  return { 
    greetingFiles, 
    isLoading, 
    error, 
    isError: !!error,
    refreshGreetingFiles,
    deleteGreetingFile,
    forceRefresh
  };
}
