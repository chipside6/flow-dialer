
import { useQueryClient } from "@tanstack/react-query";

export function useRefreshGreetingFiles(userId: string | undefined) {
  const queryClient = useQueryClient();
  
  // Create a wrapper for refetch that returns a Promise<void> for compatibility
  const refreshGreetingFiles = async (): Promise<void> => {
    try {
      await queryClient.refetchQueries({ 
        queryKey: ['greetingFiles', userId],
        exact: true 
      });
    } catch (error) {
      console.error("Error refreshing greeting files:", error);
      // Toast is already shown by the query's error handling
    }
  };

  return { refreshGreetingFiles };
}
