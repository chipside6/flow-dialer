
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all campaigns for a specific user
 */
export const fetchCampaigns = async (userId: string) => {
  console.log(`[CampaignsService] Fetching campaigns for user: ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[CampaignsService] Error in fetchCampaigns:`, error);
      throw error;
    }
    
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
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        title: campaign.title,
        description: campaign.description,
        greeting_file_url: campaign.greetingFileUrl || null,
        greeting_file_name: campaign.greetingFileName || null,
        transfer_number: campaign.transferNumber || null,
        status: campaign.status || 'pending',
        progress: campaign.progress || 0,
        total_calls: campaign.totalCalls || 0,
        answered_calls: campaign.answeredCalls || 0,
        transferred_calls: campaign.transferredCalls || 0,
        failed_calls: campaign.failedCalls || 0,
        contact_list_id: campaign.contactListId || null,
        sip_provider_id: campaign.sipProviderId || null,
        port_number: campaign.portNumber || 1 // Include the port number
      })
      .select()
      .single();
    
    if (error) {
      console.error(`[CampaignsService] Error in createCampaign:`, error);
      throw error;
    }
    
    console.log(`[CampaignsService] Successfully created campaign:`, data);
    
    return data;
  } catch (error) {
    console.error(`[CampaignsService] Error in createCampaign:`, error);
    throw error;
  }
};
