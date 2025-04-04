
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { useFetchCampaigns } from "./useFetchCampaigns";
import { CampaignState, UseCampaignsResult, FetchCampaignsResult } from "./types";
import { Campaign } from "@/types/campaign";

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
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const { fetchCampaigns } = useFetchCampaigns();
  const errorToastShownRef = useRef(false);

  // Define refreshCampaigns as a callback function
  const refreshCampaigns = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result: FetchCampaignsResult = await fetchCampaigns({ 
        user, 
        isAuthenticated 
      });
      
      setState({
        campaigns: result.data as Campaign[],
        isLoading: false,
        error: result.error
      });
      
      if (result.error && !errorToastShownRef.current) {
        // Only show error toast once to avoid duplicates
        errorToastShownRef.current = true;
        setTimeout(() => {
          errorToastShownRef.current = false;
        }, 5000);
        
        // Don't show error toast for timeout errors, let the UI handle it
        if (!result.isTimeoutError) {
          toast({
            title: "Error refreshing campaigns",
            description: result.error.message,
            variant: "destructive"
          });
        }
        return false;
      }
      return true;
    } catch (error: any) {
      console.error('Error refreshing campaigns:', error.message);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error 
      }));
      
      if (!errorToastShownRef.current) {
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
  }, [user, isAuthenticated, toast, fetchCampaigns]);

  useEffect(() => {
    let isMounted = true;
    
    const loadCampaigns = async () => {
      try {
        // Clear any existing loading timeout
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        // Set a new loading timeout
        loadingTimeoutRef.current = setTimeout(() => {
          if (state.isLoading && isMounted) {
            console.log("Campaigns loading timeout reached, ending loading state");
            setState(prev => ({ ...prev, isLoading: false }));
          }
        }, 12000); // 12 seconds timeout

        // Implement retry logic for network errors
        let result: FetchCampaignsResult = {
          data: [],
          error: null,
          isAuthError: false,
          isTimeoutError: false
        };
        const maxRetries = 2;
        
        while (retryCountRef.current <= maxRetries) {
          result = await fetchCampaigns({ 
            user, 
            isAuthenticated 
          });
          
          // If successful or not a timeout error, break the retry loop
          if (!result.error || !result.isTimeoutError) {
            break;
          }
          
          console.log(`Retrying fetch (attempt ${retryCountRef.current + 1} of ${maxRetries})...`);
          retryCountRef.current++;
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Reset retry counter
        retryCountRef.current = 0;
        
        // If component is still mounted, update state
        if (isMounted) {
          setState({
            campaigns: result.data as Campaign[],
            isLoading: false,
            error: result.error
          });
          
          // Only show error toast if this is an auth error and not already shown
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
      }
    };

    loadCampaigns();

    // Cleanup function
    return () => {
      isMounted = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [user, isAuthenticated, fetchCampaigns]);

  return {
    campaigns: state.campaigns,
    isLoading: state.isLoading,
    error: state.error,
    refreshCampaigns
  };
};
