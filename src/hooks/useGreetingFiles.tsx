
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
    // Clear previous timeout to prevent multiple timeouts
    let loadingTimeout: NodeJS.Timeout | undefined;
    
    if (isQueryLoading || isFetching) {
      setIsLoading(true);
      
      // Set a reasonable timeout to prevent infinite loading states
      loadingTimeout = setTimeout(() => {
        setIsLoading(false);
        
        // Only show toast if we still don't have data
        if (!greetingFiles || greetingFiles.length === 0) {
          toast({
            title: "Loading timeout",
            description: "Loading is taking longer than expected. Please try again.",
            variant: "destructive",
            action: (
              <ToastAction altText="Retry" onClick={forceRefresh}>
                Retry Loading
              </ToastAction>
            )
          });
        }
      }, 6000); // 6 seconds timeout
    } else {
      // When query is done, end loading state after a short delay
      // This ensures we have a minimum loading time for UI consistency
      const minLoadingDelay = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(minLoadingDelay);
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
