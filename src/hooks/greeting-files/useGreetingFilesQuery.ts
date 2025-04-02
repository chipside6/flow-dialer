
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { DbGreetingFile, GreetingFile } from "./types";

export function useGreetingFilesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['greetingFiles', userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No user detected, returning empty array");
        return [];
      }
      
      console.log("Fetching greeting files for user:", userId);
      try {
        // Create an AbortController for the timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const { data, error } = await supabase
          .from('greeting_files')
          .select('*')
          .eq('user_id', userId)
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
    staleTime: 20 * 1000, // 20 seconds
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 5000), // Max delay 5 seconds
    enabled: !!userId, // Only run query when user is available
    refetchOnWindowFocus: false,
    placeholderData: [] // Fallback to prevent blocking UI
  });
}
