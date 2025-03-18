
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useGreetingFiles(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch greeting files
  const greetingFilesQuery = useQuery({
    queryKey: ['greetingFiles'],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('greeting_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching greeting files:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  // Delete greeting file mutation
  const deleteGreetingFile = useMutation({
    mutationFn: async (fileId: string) => {
      if (!userId) throw new Error('User not authenticated');
      
      // First get the file info to get the path
      const { data: fileData, error: fetchError } = await supabase
        .from('greeting_files')
        .select('filename, url')
        .eq('id', fileId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Parse filename from URL to get the storage path
      const urlPath = new URL(fileData.url).pathname;
      const filePath = urlPath.split('/').pop();
      const storagePath = `${userId}/${filePath}`;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('greetings')
        .remove([storagePath]);
      
      if (storageError) {
        console.warn("Storage delete error (continuing anyway):", storageError);
        // We still continue with the database deletion even if storage fails
      }
      
      // Delete from database
      const { error: deleteError } = await supabase
        .from('greeting_files')
        .delete()
        .eq('id', fileId);
      
      if (deleteError) throw deleteError;
      
      return fileId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greetingFiles'] });
      toast({
        title: 'File deleted',
        description: 'The greeting file has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting file',
        description: error.message,
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
