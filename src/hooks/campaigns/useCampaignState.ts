
import { useState, useEffect } from "react";
import { Campaign } from "@/types/campaign";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook for managing campaign state
 */
export const useCampaignState = (initialCampaigns: Campaign[] = []) => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
  // Set selected campaign when selectedCampaignId changes
  useEffect(() => {
    if (selectedCampaignId) {
      const campaign = campaigns.find(c => c.id === selectedCampaignId);
      if (campaign) {
        setSelectedCampaign(campaign);
      }
    } else {
      setSelectedCampaign(null);
    }
  }, [selectedCampaignId, campaigns]);

  // Load campaigns from props
  useEffect(() => {
    if (initialCampaigns.length > 0) {
      console.log("Setting campaigns from initialCampaigns:", initialCampaigns);
      setCampaigns(initialCampaigns);
    }
  }, [initialCampaigns]);

  return {
    campaigns,
    setCampaigns,
    selectedCampaign,
    setSelectedCampaign,
    selectedCampaignId,
    setSelectedCampaignId,
    toast
  };
};
