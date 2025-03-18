
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useGreetingFiles(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch greeting files
  const greetingFilesQuery = useQuery({
    queryKey: ['greetingFiles', userId],
    queryFn: async () => {
      console.log("Fetching greeting files for user:", userId);
      if (!userId) {
        console.error("User ID is undefined in useGreetingFiles");
        throw new Error('User not authenticated');
      }
      
      try {
        const { data, error } = await supabase
          .from('greeting_files')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching greeting files:", error);
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} greeting files`);
        return data || [];
      } catch (error) {
        console.error("Exception in greeting files query:", error);
        throw error;
      }
    },
    enabled: !!userId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Delete greeting file mutation
  const deleteGreetingFile = useMutation({
    mutationFn: async (fileId: string) => {
      if (!userId) throw new Error('User not authenticated');
      
      console.log("Deleting file:", fileId);
      
      // First get the file info to get the path
      const { data: fileData, error: fetchError } = await supabase
        .from('greeting_files')
        .select('filename, url')
        .eq('id', fileId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching file info for deletion:", fetchError);
        throw fetchError;
      }
      
      // Parse filename from URL to get the storage path
      const urlPath = new URL(fileData.url).pathname;
      const filePath = urlPath.split('/').pop();
      const storagePath = `${userId}/${filePath}`;
      
      console.log("Deleting from storage:", storagePath);
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('greetings')
        .remove([storagePath]);
      
      if (storageError) {
        console.warn("Storage delete error (continuing anyway):", storageError);
        // We still continue with the database deletion even if storage fails
      }
      
      console.log("Deleting from database:", fileId);
      
      // Delete from database
      const { error: deleteError } = await supabase
        .from('greeting_files')
        .delete()
        .eq('id', fileId);
      
      if (deleteError) {
        console.error("Database delete error:", deleteError);
        throw deleteError;
      }
      
      return fileId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greetingFiles', userId] });
      toast({
        title: 'File deleted',
        description: 'The greeting file has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      console.error("Error in delete mutation:", error);
      toast({
        title: 'Error deleting file',
        description: error.message || 'Failed to delete file',
        variant: 'destructive',
      });
    },
  });

  return {
    greetingFiles: greetingFilesQuery.data || [],
    isLoading: greetingFilesQuery.isLoading,
    isError: greetingFilesQuery.isError,
    error: greetingFilesQuery.error,
    deleteGreetingFile
  };
}
