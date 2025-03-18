
import { useState, useEffect } from "react";
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

  useEffect(() => {
    let isMounted = true;
    const maxRetries = 2;
    
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        
        // If no user is logged in, return empty array
        if (!user) {
          console.log("No user, returning empty campaigns array");
          if (isMounted) {
            setCampaigns([]);
            setIsLoading(false);
          }
          return;
        }

        console.log("Fetching campaigns for user:", user.id);
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
          
          console.log("Campaigns fetched:", transformedData);
          setCampaigns(transformedData);
          setIsLoading(false);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (error: any) {
        console.error('Error fetching campaigns:', error.message);
        
        // Only show toast for certain errors or after retries
        if (retryCount >= maxRetries) {
          toast({
            title: "Error loading campaigns",
            description: error.message,
            variant: "destructive"
          });
        }
        
        // If component is still mounted, update state
        if (isMounted) {
          // Return empty array on error
          setCampaigns([]);
          setIsLoading(false);
          
          // Retry logic
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            setTimeout(fetchCampaigns, 2000); // Retry after 2 seconds
          }
        }
      }
    };

    fetchCampaigns();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user, toast, retryCount]);

  return { campaigns, isLoading };
};
