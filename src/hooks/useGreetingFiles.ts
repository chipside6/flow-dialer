
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { GreetingFile } from "./greeting-files/types";
import { useGreetingFilesQuery } from "./greeting-files/useGreetingFilesQuery";
import { useDeleteGreetingFile } from "./greeting-files/useDeleteGreetingFile";
import { useRefreshGreetingFiles } from "./greeting-files/useRefreshGreetingFiles";
import { useErrorHandling } from "./greeting-files/useErrorHandling";
import { toast } from "@/components/ui/use-toast";

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
    isLoading: isQueryLoading
  } = useGreetingFilesQuery(user?.id);
  
  // Handle errors
  useErrorHandling(error as Error | null);
  
  // Handle the delete operation - export the mutation result directly
  const deleteGreetingFile = useDeleteGreetingFile(user?.id);
  
  // Handle refreshing the files
  const { refreshGreetingFiles } = useRefreshGreetingFiles(user?.id);

  // Set up a safety timeout to prevent stuck loading state
  useEffect(() => {
    setIsLoading(isQueryLoading);
    
    // Set a timeout to end loading state after 15 seconds, regardless of query state
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Fetch timeout reached, ending loading state");
        setIsLoading(false);
        
        if (!greetingFiles || greetingFiles.length === 0) {
          toast({
            title: "Could not load files",
            description: "There was a problem loading your audio files. Please try again later.",
            variant: "destructive"
          });
        }
      }
    }, 15000);
    
    return () => clearTimeout(loadingTimeout);
  }, [isQueryLoading, greetingFiles]);

  return { 
    greetingFiles, 
    isLoading, 
    error, 
    isError: !!error,
    refreshGreetingFiles,
    deleteGreetingFile // Return the mutation result directly
  };
}
