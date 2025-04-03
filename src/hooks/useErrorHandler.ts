
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const useErrorHandler = () => {
  const { isOnline } = useNetworkStatus();

  const handleError = useCallback((error: any, title: string = "Error") => {
    console.error("Error handled:", error);
    
    // Check if error is a network/connection issue
    const isConnectionError = 
      !isOnline || 
      error.message?.includes('connection') || 
      error.message?.includes('network') || 
      error.message?.includes('timeout') || 
      error.message?.includes('abort') ||
      error.name === 'AbortError';
    
    if (isConnectionError) {
      toast({
        title: "Connection Error",
        description: isOnline 
          ? "Failed to connect to the server. Please try again later." 
          : "You appear to be offline. Please check your internet connection.",
        variant: "destructive"
      });
      return;
    }
    
    // Handle authentication errors
    if (error.message?.includes('auth') || error.message?.includes('JWT')) {
      toast({
        title: "Authentication Error",
        description: "Your session has expired. Please log in again.",
        variant: "destructive"
      });
      return;
    }
    
    // Generic error handler for other cases
    toast({
      title,
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
  }, [isOnline]);

  return { handleError };
};
