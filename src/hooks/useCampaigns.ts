
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        
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
      } catch (error: any) {
        console.error('Error fetching campaigns:', error.message);
        toast({
          title: "Error loading campaigns",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [user, toast]);

  return { campaigns, isLoading };
};
