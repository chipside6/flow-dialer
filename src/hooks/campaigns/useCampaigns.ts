
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { useFetchCampaigns } from "./useFetchCampaigns";
import { CampaignState, UseCampaignsResult } from "../types/campaign";
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
  const { fetchCampaigns } = useFetchCampaigns();

  // Define refreshCampaigns as a callback function
  const refreshCampaigns = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await fetchCampaigns({ 
        user, 
        isAuthenticated 
      });
      
      setState({
        campaigns: data as Campaign[],
        isLoading: false,
        error
      });
      
      if (error) {
        toast({
          title: "Error refreshing campaigns",
          description: error.message,
          variant: "destructive"
        });
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
      
      toast({
        title: "Error refreshing campaigns",
        description: error.message,
        variant: "destructive"
      });
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
        }, 8000);

        const { data, error, isAuthError } = await fetchCampaigns({ 
          user, 
          isAuthenticated 
        });
        
        // If component is still mounted, update state
        if (isMounted) {
          setState({
            campaigns: data as Campaign[],
            isLoading: false,
            error
          });
          
          // Show error toast if needed
          if (error) {
            if (isAuthError) {
              toast({
                title: "Authentication Error",
                description: "Your session may have expired. Please try logging in again.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Error loading campaigns",
                description: error.message,
                variant: "destructive"
              });
            }
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
  }, [user, isAuthenticated, toast, fetchCampaigns]);

  return {
    campaigns: state.campaigns,
    isLoading: state.isLoading,
    error: state.error,
    refreshCampaigns
  };
};
