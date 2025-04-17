
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
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);

  // Set up loading state management
  useEffect(() => {
    // Only set loading to true when starting a new query
    if (isQueryLoading && !isFetching) {
      setIsLoading(true);
    }
    
    // When query is done or there's an error, end loading state
    if (!isQueryLoading || isError) {
      setIsLoading(false);
    }
    
    // Set a timeout to end loading state after 10 seconds, reduced from 15
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Fetch timeout reached, ending loading state");
        setIsLoading(false);
        
        if (!greetingFiles || greetingFiles.length === 0) {
          // Only show toast if we haven't loaded files yet
          toast({
            title: "Could not load files",
            description: "There was a problem loading your audio files. Please try refreshing the page.",
            variant: "destructive",
            action: <ToastAction altText="Retry" onClick={() => forceRefresh()}>
              Retry
            </ToastAction>
          });
        }
      }
    }, 10000); // Reduced from 15 seconds to 10 seconds
    
    return () => clearTimeout(loadingTimeout);
  }, [isQueryLoading, isFetching, isLoading, isError, greetingFiles, forceRefresh]);

  return { 
    greetingFiles, 
    isLoading, 
    error, 
    isError: !!error,
    refreshGreetingFiles,
    deleteGreetingFile, // Return the mutation result directly
    forceRefresh
  };
}
