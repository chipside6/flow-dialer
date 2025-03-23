
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
  file_path?: string;
  file_type?: string;
  file_size?: number;
  duration_seconds?: number | null;
  created_at: string;
}

export function useGreetingFiles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use React Query to fetch greeting files
  const { 
    data: greetingFiles = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['greetingFiles', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("Fetching greeting files for user:", user.id);
      const { data, error } = await supabase
        .from('greeting_files')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching greeting files:", error);
        throw error;
      }
      
      console.log("Greeting files fetched:", data?.length || 0);
      return data || [];
    },
    enabled: !!user,
  });

  // Mutation for deleting greeting files
  const deleteGreetingFile = useMutation({
    mutationFn: async (fileId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("Deleting greeting file:", fileId);
      
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
      
      // Try to delete from storage if we have a file path
      if (fileData && 'file_path' in fileData && fileData.file_path) {
        const filePath = fileData.file_path as string; // Explicitly cast to string
        const { error: storageError } = await supabase.storage
          .from('voice-app-uploads')
          .remove([filePath]);
          
        if (storageError) {
          console.warn("Could not delete file from storage:", storageError);
          // Don't throw here, consider the deletion successful if DB entry is gone
        }
      }
      
      return fileId;
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
  const refreshGreetingFiles = async (): Promise<void> => {
    await refetch();
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
