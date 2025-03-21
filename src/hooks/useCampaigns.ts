
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { logSupabaseOperation, OperationType, isAuthError } from "@/utils/supabaseDebug";

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
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCampaigns = async () => {
      try {
        // If no user is logged in, return empty array
        if (!user || !isAuthenticated) {
          console.log("No authenticated user, returning empty campaigns array");
          logSupabaseOperation({
            operation: OperationType.READ,
            table: "campaigns",
            user_id: null,
            auth_status: "UNAUTHENTICATED",
            success: true,
            data: []
          });
          
          if (isMounted) {
            setCampaigns([]);
            setIsLoading(false);
            setError(null);
          }
          return;
        }

        console.log("Fetching campaigns for user:", user.id);
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          logSupabaseOperation({
            operation: OperationType.READ,
            table: "campaigns",
            user_id: user.id,
            auth_status: "AUTHENTICATED",
            success: false,
            error
          });
          throw error;
        }
        
        // Log successful operation
        logSupabaseOperation({
          operation: OperationType.READ,
          table: "campaigns",
          user_id: user.id,
          auth_status: "AUTHENTICATED",
          success: true,
          data: data
        });
        
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
          setError(null);
        }
      } catch (error: any) {
        console.error('Error fetching campaigns:', error.message);
        
        // Check if this is an auth error
        const authIssue = isAuthError(error);
        
        // If component is still mounted, update state
        if (isMounted) {
          setError(error);
          setIsLoading(false);
          
          if (authIssue) {
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
    };

    fetchCampaigns();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated, toast]);

  // Function to manually refresh campaigns
  const refreshCampaigns = async () => {
    setIsLoading(true);
    try {
      if (!user || !isAuthenticated) {
        setCampaigns([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        logSupabaseOperation({
          operation: OperationType.READ,
          table: "campaigns",
          user_id: user.id,
          auth_status: "AUTHENTICATED",
          success: false,
          error
        });
        throw error;
      }
      
      // Log successful operation
      logSupabaseOperation({
        operation: OperationType.READ,
        table: "campaigns",
        user_id: user.id,
        auth_status: "AUTHENTICATED",
        success: true,
        data: data
      });
      
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
      
      setCampaigns(transformedData);
      setError(null);
    } catch (error: any) {
      console.error('Error refreshing campaigns:', error.message);
      setError(error);
      
      toast({
        title: "Error refreshing campaigns",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { campaigns, isLoading, error, refreshCampaigns };
};
