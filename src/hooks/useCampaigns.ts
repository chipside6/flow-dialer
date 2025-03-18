
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Campaign {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "paused";
  progress: number;
  totalCalls: number;
  answeredCalls: number;
  transferredCalls: number;
  failedCalls: number;
  user_id: string;
}

export const useCampaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch campaigns with retry logic
  const fetchCampaigns = useCallback(async (isMounted: boolean) => {
    try {
      console.log("Attempting to fetch campaigns, retry #", retryCount);
      
      // If no user is logged in, return empty array
      if (!user) {
        console.log("No user, returning empty campaigns array");
        if (isMounted) {
          setCampaigns([]);
          setIsLoading(false);
          setError(null);
        }
        return;
      }

      console.log("Fetching campaigns for user:", user.id);
      
      // Add a small delay before fetching to ensure auth state is fully loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // If component is still mounted, update state
      if (isMounted) {
        // Transform data to match the Campaign interface
        const transformedData = (data || []).map((campaign: any) => ({
          id: campaign.id || `camp-${Date.now()}`,
          title: campaign.title || 'Untitled Campaign',
          status: campaign.status || 'pending',
          progress: campaign.progress || 0,
          totalCalls: campaign.total_calls || 0,
          answeredCalls: campaign.answered_calls || 0,
          transferredCalls: campaign.transferred_calls || 0,
          failedCalls: campaign.failed_calls || 0,
          user_id: campaign.user_id
        }));
        
        console.log("Campaigns fetched successfully:", transformedData.length);
        setCampaigns(transformedData);
        setIsLoading(false);
        setError(null);
        setRetryCount(0); // Reset retry count on success
      }
    } catch (error: any) {
      console.error('Error fetching campaigns:', error.message);
      
      // If component is still mounted, update state
      if (isMounted) {
        setError(error);
        
        // Exit loading state after a short delay
        setTimeout(() => {
          if (isMounted) {
            setIsLoading(false);
            // Only show empty array for bad errors or after all retries fail
            if (retryCount >= 2) {
              setCampaigns([]);
              // Show toast only after final retry
              toast({
                title: "Error loading campaigns",
                description: error.message,
                variant: "destructive"
              });
            }
          }
        }, 1000);
      }
      
      return error;
    }
  }, [user, toast, retryCount]);

  useEffect(() => {
    console.log("useCampaigns hook initialized, user:", user?.id);
    
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    const maxRetries = 2;
    
    // Force exit loading state after 8 seconds
    const loadingTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Loading timeout reached, forcing exit of loading state");
        setIsLoading(false);
        if (!campaigns.length) {
          setCampaigns([]);
        }
      }
    }, 8000);
    
    // Initial fetch
    fetchCampaigns(isMounted).then(error => {
      // Only retry on certain errors and if under max retries
      if (error && retryCount < maxRetries && isMounted) {
        console.log(`Scheduling retry #${retryCount + 1} in 2 seconds`);
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setRetryCount(prev => prev + 1);
          }
        }, 2000);
      }
    });

    // Cleanup function
    return () => {
      console.log("useCampaigns cleanup");
      isMounted = false;
      clearTimeout(timeoutId);
      clearTimeout(loadingTimeout);
    };
  }, [user, fetchCampaigns, retryCount, isLoading, campaigns.length]);

  // Add subscription to auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in useCampaigns:", event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Reset state and trigger refetch
        setIsLoading(true);
        setRetryCount(0);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { campaigns, isLoading, error };
};
