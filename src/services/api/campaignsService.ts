
import { apiFetch } from './apiConfig';

/**
 * Fetches all campaigns for a specific user
 */
export const fetchCampaigns = async (userId: string) => {
  console.log(`[CampaignsService] Fetching campaigns for user: ${userId}`);
  
  try {
    const data = await apiFetch(`campaigns?userId=${userId}`);
    console.log(`[CampaignsService] Fetched ${data.length} campaigns successfully`);
    
    return data;
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
