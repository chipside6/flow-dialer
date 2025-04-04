import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { useFetchCampaigns } from "./useFetchCampaigns";
import { CampaignState, UseCampaignsResult } from "./types";
import { Campaign } from "@/types/campaign";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

/**
 * Primary hook for managing campaigns data
 */
export const useCampaigns = (): UseCampaignsResult => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<CampaignState>({
    campaigns: [],
    isLoading: true,
    error: null
  });
  
  const { isOnline } = useNetworkStatus();
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const { fetchCampaigns } = useFetchCampaigns();
  const errorToastShownRef = useRef(false);
  const fetchAttemptedRef = useRef(false);
  const silentErrorsRef = useRef(false);

  // Define refreshCampaigns as a callback function
  const refreshCampaigns = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Cannot refresh campaigns while offline",
        variant: "destructive"
      });
      return false;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await fetchCampaigns({ 
        user, 
        isAuthenticated 
      });
      
      // Even if there's an error, save any data we received
      setState(prev => ({
        campaigns: result.data as Campaign[] || prev.campaigns,
        isLoading: false,
        // Only set error if we have no campaigns data at all
        error: prev.campaigns.length === 0 && result.data.length === 0 ? result.error : null
      }));
      
      if (result.error && !errorToastShownRef.current && !silentErrorsRef.current) {
        // Only show error toast once to avoid duplicates
        errorToastShownRef.current = true;
        setTimeout(() => {
          errorToastShownRef.current = false;
        }, 5000);
        
        // Don't show error toast for timeout errors, let the UI handle it
        if (!result.isTimeoutError && !result.isOfflineError) {
          toast({
            title: "Error refreshing campaigns",
            description: result.error.message,
            variant: "destructive"
          });
        }
        
        // If we have data, still return true to indicate success
        return result.data.length > 0;
      }
      return true;
    } catch (error: any) {
      console.error('Error refreshing campaigns:', error.message);
      
      // Keep any existing data
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        // Only set error if we have no campaigns data
        error: prev.campaigns.length === 0 ? error : null
      }));
      
      if (!errorToastShownRef.current && !silentErrorsRef.current) {
        errorToastShownRef.current = true;
        setTimeout(() => {
          errorToastShownRef.current = false;
        }, 5000);
        
        toast({
          title: "Error refreshing campaigns",
          description: error.message || "An unexpected error occurred",
          variant: "destructive"
        });
      }
      return false;
    }
  }, [user, isAuthenticated, toast, fetchCampaigns, isOnline]);

  // First time data load - handle silently without error messages
  useEffect(() => {
    let isMounted = true;
    
    // Only fetch if we haven't tried yet, or we have auth details and we're online
    if (!fetchAttemptedRef.current && isAuthenticated && user?.id && isOnline) {
      fetchAttemptedRef.current = true;
      silentErrorsRef.current = true; // Suppress errors for initial load
      
      const loadCampaigns = async () => {
        try {
          // Clear any existing loading timeout
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          
          // Set a timeout to ensure we're not showing the loading state for too long
          loadingTimeoutRef.current = setTimeout(() => {
            if (state.isLoading && isMounted) {
              console.log("Campaigns loading timeout reached, ending loading state");
              setState(prev => ({ ...prev, isLoading: false }));
            }
          }, 6000); // 6 seconds timeout

          const result = await fetchCampaigns({ 
            user, 
            isAuthenticated 
          });
          
          // If component is still mounted, update state
          if (isMounted) {
            setState({
              campaigns: result.data as Campaign[],
              isLoading: false,
              // Only set error if we have no campaigns data
              error: result.data.length === 0 ? result.error : null
            });
            
            // Only show error toast if this is an auth error
            if (result.error && result.isAuthError && !errorToastShownRef.current) {
              errorToastShownRef.current = true;
              setTimeout(() => {
                errorToastShownRef.current = false;
              }, 5000);
              
              toast({
                title: "Authentication Error",
                description: "Your session may have expired. Please try logging in again.",
                variant: "destructive"
              });
            }
          }
        } finally {
          // Clear the loading timeout
          if (loadingTimeoutRef.current && isMounted) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          
          // Re-enable error messages after initial load
          setTimeout(() => {
            silentErrorsRef.current = false;
          }, 1000);
        }
      };

      loadCampaigns();
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [user?.id, isAuthenticated, fetchCampaigns, isOnline]);

  return {
    campaigns: state.campaigns,
    isLoading: state.isLoading,
    error: state.error,
    refreshCampaigns
  };
};
