
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';

export function useGreetingFiles(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { initialized } = useAuth();
  
  // Fetch greeting files
  const greetingFilesQuery = useQuery({
    queryKey: ['greetingFiles', userId],
    queryFn: async () => {
      console.log("Fetching greeting files for user:", userId);
      if (!userId) {
        console.log("User ID is undefined in useGreetingFiles - returning empty array");
        return []; // Return empty array instead of throwing when userId is undefined
      }
      
      try {
        // First check if the user is authenticated at all
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error in useGreetingFiles:", sessionError);
          throw sessionError;
        }
        
        if (!session) {
          console.warn("No active session in useGreetingFiles");
          return []; // Return empty array for unauthenticated users
        }
        
        const { data, error } = await supabase
          .from('greeting_files')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching greeting files:", error);
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} greeting files:`, data);
        return data || [];
      } catch (error) {
        console.error("Exception in greeting files query:", error);
        throw error;
      }
    },
    enabled: !!userId && initialized, // Only run query when userId is available and auth is initialized
    staleTime: 1000, // 1 second - reduce this for more frequent refreshes
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Delete greeting file mutation
  const deleteGreetingFile = useMutation({
    mutationFn: async (fileId: string) => {
      if (!userId) {
        console.error("No user ID available for file deletion");
        throw new Error('User not authenticated');
      }
      
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
    onSuccess: (fileId) => {
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
    refetch: greetingFilesQuery.refetch,
    deleteGreetingFile
  };
}
