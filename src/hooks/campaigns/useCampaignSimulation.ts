
import { useCampaignState } from "./useCampaignState";
import { useCampaignOperations } from "./useCampaignOperations";
import { Campaign } from "@/types/campaign";

/**
 * Refactored hook for campaign simulation
 * This combines the state and operations hooks
 */
export const useCampaignSimulation = (initialCampaigns: Campaign[] = []) => {
  const {
    campaigns,
    setCampaigns,
    selectedCampaign,
    setSelectedCampaign,
    selectedCampaignId,
    setSelectedCampaignId,
    toast
  } = useCampaignState(initialCampaigns);

  const {
    startCampaign,
    pauseCampaign,
    deleteCampaign
  } = useCampaignOperations(
    campaigns,
    setCampaigns,
    setSelectedCampaign,
    selectedCampaignId,
    setSelectedCampaignId,
    toast
  );
  
  return {
    campaigns,
    selectedCampaign,
    selectedCampaignId,
    setSelectedCampaign,
    setSelectedCampaignId,
    startCampaign,
    pauseCampaign,
    deleteCampaign
  };
};
