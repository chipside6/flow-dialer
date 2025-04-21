import { supabase } from '@/integrations/supabase/client';
import { CampaignData } from '@/components/campaign-wizard/types';

/**
 * Fetches all campaigns for a specific user
 */
export const fetchCampaigns = async (userId: string) => {
  console.log(`[CampaignsService] Fetching campaigns for user: ${userId}`);
  
  try {
    // First, fetch the campaigns without the join that's causing issues
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        goip_devices(*),
        campaign_ports(port_id)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[CampaignsService] Error in fetchCampaigns:`, error);
      throw error;
    }
    
    console.log(`[CampaignsService] Fetched ${data.length} campaigns successfully`);
    
    // Process the campaign data with the transfer_number directly from campaigns table
    return data.map((campaign) => {
      return {
        ...campaign,
        transferNumber: campaign.transfer_number || null,
        port_ids: campaign.campaign_ports?.map((p: any) => p.port_id) || []
      };
    });
  } catch (error) {
    console.error(`[CampaignsService] Error in fetchCampaigns:`, error);
    throw error;
  }
};

/**
 * Creates a new campaign
 */
export const createCampaign = async (campaign: CampaignData, userId: string) => {
  console.log(`[CampaignsService] Creating campaign for user: ${userId}`);
  
  try {
    // First, insert the campaign
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        title: campaign.title,
        description: campaign.description,
        greeting_file_id: campaign.greetingFileId || null,
        transfer_number: campaign.transferNumber || null, // Use transferNumber directly
        transfer_number_id: campaign.transfer_number_id || null, // Also store the transfer_number_id
        status: campaign.status || 'pending',
        progress: campaign.progress || 0,
        total_calls: campaign.totalCalls || 0,
        answered_calls: campaign.answeredCalls || 0,
        transferred_calls: campaign.transferredCalls || 0,
        failed_calls: campaign.failedCalls || 0,
        contact_list_id: campaign.contactListId || null,
        port_number: campaign.portNumber || 1, // Default to port 1 if not specified
        goip_device_id: campaign.goip_device_id || null
      })
      .select()
      .single();
    
    if (campaignError) {
      console.error(`[CampaignsService] Error in createCampaign:`, campaignError);
      throw campaignError;
    }
    
    // If we have port IDs, insert campaign port associations
    if (campaign.port_ids && campaign.port_ids.length > 0) {
      const portMappings = campaign.port_ids.map(portId => ({
        campaign_id: campaignData.id,
        port_id: portId
      }));
      
      const { error: portError } = await supabase
        .from('campaign_ports')
        .insert(portMappings);
      
      if (portError) {
        console.error(`[CampaignsService] Error adding port associations:`, portError);
        // Continue despite port association error - campaign was created successfully
      }
    }
    
    console.log(`[CampaignsService] Successfully created campaign:`, campaignData);
    
    return campaignData;
  } catch (error) {
    console.error(`[CampaignsService] Error in createCampaign:`, error);
    throw error;
  }
};

/**
 * Get campaign details including ports
 */
export const getCampaignWithPorts = async (campaignId: string) => {
  try {
    // Get campaign details without the problematic join
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        goip_devices(*),
        campaign_ports(port_id)
      `)
      .eq('id', campaignId)
      .single();
    
    if (campaignError) {
      console.error(`[CampaignsService] Error fetching campaign:`, campaignError);
      throw campaignError;
    }
    
    // Format the campaign with transfer number and port IDs
    const formattedCampaign = {
      ...campaign,
      transferNumber: campaign.transfer_number || null,
      port_ids: campaign.campaign_ports?.map((p: any) => p.port_id) || []
    };
    
    return formattedCampaign;
  } catch (error) {
    console.error(`[CampaignsService] Error in getCampaignWithPorts:`, error);
    throw error;
  }
};
