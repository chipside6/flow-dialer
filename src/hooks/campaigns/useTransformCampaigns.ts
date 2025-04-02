
import { Campaign } from "./types";

/**
 * Transform campaign data from Supabase to match the Campaign interface
 */
export const useTransformCampaigns = () => {
  const transformCampaignData = (data: any[]): Campaign[] => {
    return (data || []).map((campaign: any) => ({
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
  };

  return { transformCampaignData };
};
