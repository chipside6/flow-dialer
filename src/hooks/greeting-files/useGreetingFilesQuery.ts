
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GreetingFile } from './types';
import { toast } from '@/components/ui/use-toast';

export const ensureStorageBucket = async () => {
  try {
    // Check if bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('greetings');
    
    if (bucketError && bucketError.message.includes('not found')) {
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket('greetings', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/ogg']
      });
      
      if (createError) {
        console.error('Error creating storage bucket:', createError);
        return false;
      }
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    return false;
  }
};

export const useGreetingFilesQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['greetingFiles', userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      // First ensure the bucket exists
      const bucketExists = await ensureStorageBucket();
      if (!bucketExists) {
        toast({
          title: 'Storage setup error',
          description: 'Could not set up storage for audio files',
          variant: 'destructive'
        });
      }
      
      const { data, error } = await supabase
        .from('greeting_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data as GreetingFile[];
    },
    enabled: !!userId
  });
};
