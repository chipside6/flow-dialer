
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GreetingFile } from './types';

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
      
      console.log("Fetching greeting files for user:", userId);
      
      // First ensure the bucket exists
      const bucketExists = await ensureStorageBucket();
      if (!bucketExists) {
        console.warn('Storage setup issue: bucket creation failed');
        // Continue anyway - we might still be able to fetch existing files
      }
      
      try {
        const { data, error } = await supabase
          .from('greeting_files')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase query error:', error);
          throw new Error(`Failed to load files: ${error.message}`);
        }
        
        console.log(`Successfully fetched ${data?.length || 0} greeting files`);
        return data as GreetingFile[];
      } catch (error: any) {
        console.error('Error in greeting files query:', error);
        throw new Error(error?.message || 'Unknown error loading files');
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    refetchOnWindowFocus: false
  });
};
