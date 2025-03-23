
import { apiFetch } from './apiConfig';

/**
 * Fetches all campaigns for a specific user
 */
export const fetchCampaigns = async (userId: string) => {
  console.log(`[CampaignsService] Fetching campaigns for user: ${userId}`);
  
  try {
    const data = await apiFetch<any[]>(`campaigns?userId=${userId}`);
    console.log(`[CampaignsService] Fetched ${data.length} campaigns successfully`);
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      status: item.status || "pending",
      greetingFileUrl: item.greeting_file_url || item.greetingFileUrl || "",
      greetingFileName: item.greeting_file_name || item.greetingFileName || "",
      transferNumber: item.transfer_number || item.transferNumber || "",
      progress: item.progress || 0,
      totalCalls: item.total_calls || item.totalCalls || 0,
      answeredCalls: item.answered_calls || item.answeredCalls || 0,
      transferredCalls: item.transferred_calls || item.transferredCalls || 0,
      failedCalls: item.failed_calls || item.failedCalls || 0,
      dateCreated: new Date(item.created_at || item.dateCreated),
      dateUpdated: new Date(item.updated_at || item.dateUpdated),
      contactListId: item.contact_list_id || item.contactListId || null
    }));
  } catch (error) {
    console.error(`[CampaignsService] Error in fetchCampaigns:`, error);
    throw error;
  }
};

/**
 * Creates a new campaign
 */
export const createCampaign = async (campaign: any, userId: string) => {
  console.log(`[CampaignsService] Creating campaign for user: ${userId}`);
  
  try {
    const data = await apiFetch('campaigns', {
      method: 'POST',
      body: JSON.stringify({
        ...campaign,
        user_id: userId
      })
    });
    
    console.log(`[CampaignsService] Successfully created campaign:`, data);
    
    return data;
  } catch (error) {
    console.error(`[CampaignsService] Error in createCampaign:`, error);
    throw error;
  }
};
