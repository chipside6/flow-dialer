
import { useCallback } from "react";
import { Campaign } from "@/types/campaign";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { simulateCampaignProgress } from "./campaignSimulationUtils";

/**
 * Hook for campaign operations (start, pause, delete)
 */
export const useCampaignOperations = (
  campaigns: Campaign[],
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>,
  setSelectedCampaign: (campaign: Campaign | null) => void,
  selectedCampaignId: string | null,
  setSelectedCampaignId: (id: string | null) => void,
  toast: any
) => {
  const { user } = useAuth();

  const startCampaign = useCallback(async (campaignId: string) => {
    // Update campaign status in Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('campaigns')
          .update({ 
            status: 'running'
          })
          .eq('id', campaignId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update campaign status:", err);
        toast({
          title: "Error starting campaign",
          description: "Failed to update campaign status",
          variant: "destructive"
        });
        return;
      }
    }
    
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          // Select this campaign to view its details
          const updatedCampaign = {...campaign, status: "running" as Campaign["status"]};
          setSelectedCampaign(updatedCampaign);
          
          // Start the simulation for the campaign
          simulateCampaignProgress(campaignId, campaigns, setCampaigns, setSelectedCampaign, user, toast);
          
          return updatedCampaign;
        }
        return campaign;
      })
    );
    
    toast({
      title: "Campaign Started",
      description: "The autodialer is now processing your call list.",
    });
  }, [user, toast, campaigns, setCampaigns, setSelectedCampaign]);

  const pauseCampaign = useCallback(async (campaignId: string) => {
    // Update campaign status in Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('campaigns')
          .update({ 
            status: 'paused'
          })
          .eq('id', campaignId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update campaign status:", err);
        toast({
          title: "Error pausing campaign",
          description: "Failed to update campaign status",
          variant: "destructive"
        });
        return;
      }
    }
    
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          const updatedCampaign = {...campaign, status: "paused" as Campaign["status"]};
          setSelectedCampaign(updatedCampaign);
          return updatedCampaign;
        }
        return campaign;
      })
    );
    
    toast({
      title: "Campaign Paused",
      description: "The autodialer has been paused.",
    });
  }, [user, toast, setCampaigns, setSelectedCampaign]);

  // Add deleteCampaign function
  const deleteCampaign = useCallback(async (campaignId: string) => {
    // Update campaign status in Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', campaignId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete campaign:", err);
        toast({
          title: "Error deleting campaign",
          description: "Failed to delete the campaign",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Remove campaign from state
    setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
    
    // Reset selected campaign if the deleted one was selected
    if (selectedCampaignId === campaignId) {
      setSelectedCampaignId(null);
    }
    
    toast({
      title: "Campaign Deleted",
      description: "The campaign has been successfully deleted.",
    });
  }, [user, toast, setCampaigns, selectedCampaignId, setSelectedCampaignId]);

  return {
    startCampaign,
    pauseCampaign,
    deleteCampaign
  };
};
