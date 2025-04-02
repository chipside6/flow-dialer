
import { useState, useEffect } from "react";
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

  // Use React Query to fetch greeting files with improved configuration
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
        // Create an AbortController for the timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced from 15 second timeout to 10 seconds
        
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
        
        return processedData;
      } catch (error: any) {
        // Handle timeout errors
        if (error.name === 'AbortError') {
          console.error("Timeout error fetching greeting files");
          toast({
            variant: "destructive",
            title: "Connection timeout",
            description: "Failed to fetch greeting files. The server is taking too long to respond."
          });
          
          // Return empty array instead of throwing to prevent blocking UI
          return [];
        }
        
        console.error("Network or unexpected error fetching greeting files:", error);
        throw new Error("Failed to fetch greeting files. Please check your network connection.");
      }
    },
    staleTime: 20 * 1000, // 20 seconds - reduced from 30 seconds
    retry: 2,  // Reduced to 2 retries
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 5000), // Reduced max delay to 5 seconds
    enabled: !!user, // Only run query when user is available
    refetchOnWindowFocus: false, // Reduced refetching
    // Fix the TypeScript error by removing onError:
    placeholderData: [] // Add fallbacks to prevent blocking UI
  });

  // Set up error handling separately using onSuccess/onError callbacks in useEffect
  useEffect(() => {
    if (error) {
      console.error("Error in greeting files query:", error);
      toast({
        variant: "destructive",
        title: "Error loading files",
        description: error instanceof Error ? error.message : "Failed to load greeting files. Please try again."
      });
    }
  }, [error]);

  // Mutation for deleting greeting files with improved error handling
  const deleteGreetingFile = useMutation({
    mutationFn: async (fileId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("Deleting greeting file:", fileId);
      
      try {
        // Set timeout of 7 seconds (reduced from 10)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);
        
        // First, get the file details to find the storage path
        const { data: fileData, error: fetchError } = await supabase
          .from('greeting_files')
          .select('*')
          .eq('id', fileId)
          .eq('user_id', user.id)
          .abortSignal(controller.signal)
          .single();
        
        if (fetchError) {
          clearTimeout(timeoutId);
          console.error("Error fetching file details:", fetchError);
          throw fetchError;
        }
        
        // Delete the record from the database
        const { error } = await supabase
          .from('greeting_files')
          .delete()
          .eq('id', fileId)
          .eq('user_id', user.id)
          .abortSignal(controller.signal);
        
        if (error) {
          clearTimeout(timeoutId);
          console.error("Error deleting file from database:", error);
          throw error;
        }
        
        // Clear timeout since DB operations are done
        clearTimeout(timeoutId);
        
        // Cast fileData to our DbGreetingFile type to handle optional file_path
        const typedFileData = fileData as DbGreetingFile;
        
        // Try to delete from storage if we have a file path
        if (typedFileData && typedFileData.file_path) {
          const filePath = typedFileData.file_path;
          // Storage operations can fail but we still consider delete successful if DB record is gone
          try {
            await supabase.storage
              .from('voice-app-uploads')
              .remove([filePath]);
          } catch (storageError) {
            console.warn("Could not delete file from storage:", storageError);
            // Don't throw here, consider the deletion successful if DB entry is gone
          }
        }
        
        return fileId;
      } catch (error: any) {
        // Handle timeout errors
        if (error.name === 'AbortError') {
          toast({
            variant: "destructive",
            title: "Operation timed out",
            description: "The server is taking too long to respond. Please try again later."
          });
          throw new Error("Delete operation timed out");
        }
        
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
    // Add retry logic for network errors
    retry: 1, // Reduced from 2 to 1
    retryDelay: 1000,
  });

  // Create a wrapper for refetch that returns a Promise<void> for compatibility
  const refreshGreetingFiles = async (): Promise<void> => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing greeting files:", error);
      // Toast is already shown by the query's onError
    }
  };

  return { 
    greetingFiles, 
    isLoading, 
    error, 
    isError: !!error,
    refreshGreetingFiles,
    deleteGreetingFile
  };
}
