
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { DbGreetingFile } from "./types";

export function useDeleteGreetingFile(userId: string | undefined) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fileId: string) => {
      if (!userId) throw new Error("User not authenticated");
      
      console.log("Deleting greeting file:", fileId);
      
      try {
        // Set timeout of 7 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);
        
        // First, get the file details to find the storage path
        const { data: fileData, error: fetchError } = await supabase
          .from('greeting_files')
          .select('*')
          .eq('id', fileId)
          .eq('user_id', userId)
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
          .eq('user_id', userId)
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
      queryClient.invalidateQueries({ queryKey: ['greetingFiles', userId] });
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
    retry: 1,
    retryDelay: 1000,
  });
}
