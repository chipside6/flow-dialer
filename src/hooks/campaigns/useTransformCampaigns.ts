
import { Campaign } from "@/types/campaign";

/**
 * Transform campaign data from Supabase to match the Campaign interface
 */
export const useTransformCampaigns = () => {
  const transformCampaignData = (data: any[]): Campaign[] => {
    return (data || []).map((campaign: any) => ({
      id: campaign.id || `camp-${Date.now()}`,
      name: campaign.name || campaign.title || 'Untitled Campaign',
      title: campaign.title || campaign.name || 'Untitled Campaign',
      status: campaign.status || 'draft',
      progress: campaign.progress || 0,
      totalCalls: campaign.total_calls || campaign.totalCalls || 0,
      answeredCalls: campaign.answered_calls || campaign.answeredCalls || 0,
      transferredCalls: campaign.transferred_calls || campaign.transferredCalls || 0,
      failedCalls: campaign.failed_calls || campaign.failedCalls || 0,
      user_id: campaign.user_id,
      created_at: campaign.created_at || new Date().toISOString(),
      call_count: campaign.call_count || campaign.totalCalls || 0,
      answer_count: campaign.answer_count || campaign.answeredCalls || 0,
      transfer_count: campaign.transfer_count || campaign.transferredCalls || 0
    }));
  };

  return { transformCampaignData };
};
