
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface GreetingFile {
  id: string;
  user_id: string;
  filename: string;
  url: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  duration_seconds?: number | null;
  created_at: string;
}

// Define an interface for the raw database response
interface DbGreetingFile {
  id: string;
  user_id: string;
  filename: string;
  url: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  duration_seconds?: number | null;
  created_at: string;
}

export function useGreetingFiles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [manualRefetchQueued, setManualRefetchQueued] = useState(false);

  // Use React Query to fetch greeting files
  const { 
    data: greetingFiles = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['greetingFiles', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("No user detected, returning empty array");
        return [];
      }
      
      console.log("Fetching greeting files for user:", user.id);
      try {
        // Create a controller to be able to abort the fetch if it takes too long
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 12000); // 12 second timeout
        
        const { data, error } = await supabase
          .from('greeting_files')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal);
        
        // Clear the timeout
        clearTimeout(timeoutId);

        if (error) {
          console.error("Error fetching greeting files:", error);
          throw error;
        }
        
        console.log("Greeting files fetched:", data?.length || 0);
        
        // Transform the data to ensure each record has a file_path property
        const processedData: GreetingFile[] = (data as DbGreetingFile[] || []).map(file => ({
          ...file,
          // Set a default value if file_path is somehow missing
          file_path: file.file_path || ''
        }));
        
        // Reset fetch attempts on successful fetch
        setFetchAttempts(0);
        
        return processedData;
      } catch (error: any) {
        console.error("Network or unexpected error fetching greeting files:", error);
        
        // If we got an abort error, throw a more user-friendly error
        if (error.code === 20 || error.name === 'AbortError' || error.message?.includes('aborted')) {
          throw new Error("Request timed out. Please try refreshing the page.");
        }
        
        // Increment fetch attempts
        setFetchAttempts(prev => prev + 1);
        
        throw new Error(error.message || "Failed to fetch greeting files. Please check your network connection.");
      }
    },
    staleTime: 30 * 1000, // 30 seconds (reduced from 60 seconds)
    retry: 2,  // Retry twice automatically
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000), // Exponential backoff with max 8s
    enabled: !!user, // Only run query when user is available
    refetchOnWindowFocus: true, // Re-enable refetch on window focus
  });

  // Effect to handle queued refetch when fetch attempts reach the limit
  useEffect(() => {
    if (manualRefetchQueued && !isLoading) {
      const timer = setTimeout(() => {
        refetch();
        setManualRefetchQueued(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [manualRefetchQueued, isLoading, refetch]);

  // Mutation for deleting greeting files
  const deleteGreetingFile = useMutation({
    mutationFn: async (fileId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("Deleting greeting file:", fileId);
      
      try {
        // First, get the file details to find the storage path
        const { data: fileData, error: fetchError } = await supabase
          .from('greeting_files')
          .select('*')
          .eq('id', fileId)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) {
          console.error("Error fetching file details:", fetchError);
          throw fetchError;
        }
        
        // Delete the record from the database
        const { error } = await supabase
          .from('greeting_files')
          .delete()
          .eq('id', fileId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error deleting file from database:", error);
          throw error;
        }
        
        // Cast fileData to our DbGreetingFile type to handle optional file_path
        const typedFileData = fileData as DbGreetingFile;
        
        // Try to delete from storage if we have a file path
        if (typedFileData && typedFileData.file_path) {
          const filePath = typedFileData.file_path;
          const { error: storageError } = await supabase.storage
            .from('voice-app-uploads')
            .remove([filePath]);
            
          if (storageError) {
            console.warn("Could not delete file from storage:", storageError);
            // Don't throw here, consider the deletion successful if DB entry is gone
          }
        }
        
        return fileId;
      } catch (error) {
        console.error("Error in delete operation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch greeting files
      queryClient.invalidateQueries({ queryKey: ['greetingFiles', user?.id] });
      toast({
        title: "File deleted",
        description: "Greeting file has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting file",
        description: error.message || "Failed to delete greeting file",
        variant: "destructive",
      });
    },
  });

  // Create a wrapper for refetch that returns a Promise<void> for compatibility
  const refreshGreetingFiles = useCallback(async (): Promise<void> => {
    if (isLoading) {
      // Queue a refetch for when the current one completes
      setManualRefetchQueued(true);
      return Promise.resolve();
    }
    
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Greeting files have been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing greeting files:", error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh greeting files. Please try again.",
        variant: "destructive",
      });
    }
    
    return Promise.resolve();
  }, [isLoading, refetch, toast]);

  return { 
    greetingFiles, 
    isLoading, 
    error, 
    isError: !!error,
    refreshGreetingFiles,
    deleteGreetingFile,
    fetchAttempts
  };
}
