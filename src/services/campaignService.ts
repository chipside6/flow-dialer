
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Pause a running campaign
 * @param campaignId The ID of the campaign to pause
 * @returns A Promise resolving to the updated campaign data
 */
export const pauseCampaign = async (campaignId: string) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status: 'paused' })
      .eq('id', campaignId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error pausing campaign:', error);
    throw error;
  }
};

/**
 * Resume a paused campaign
 * @param campaignId The ID of the campaign to resume
 * @returns A Promise resolving to the updated campaign data
 */
export const resumeCampaign = async (campaignId: string) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status: 'running' })
      .eq('id', campaignId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error resuming campaign:', error);
    throw error;
  }
};

/**
 * Stop a campaign
 * @param campaignId The ID of the campaign to stop
 * @returns A Promise resolving to the updated campaign data
 */
export const stopCampaign = async (campaignId: string) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status: 'completed' })
      .eq('id', campaignId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error stopping campaign:', error);
    throw error;
  }
};

/**
 * Start a new campaign
 * @param campaignId The ID of the campaign to start
 * @returns A Promise resolving to the updated campaign data
 */
export const startCampaign = async (campaignId: string) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ 
        status: 'running',
        progress: 0,
        total_calls: 0,
        answered_calls: 0,
        transferred_calls: 0,
        failed_calls: 0
      })
      .eq('id', campaignId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error starting campaign:', error);
    throw error;
  }
};

/**
 * Get campaign details
 * @param campaignId The ID of the campaign
 * @returns A Promise resolving to the campaign data
 */
export const getCampaignDetails = async (campaignId: string) => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        contact_lists!inner(
          id,
          name,
          description
        )
      `)
      .eq('id', campaignId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting campaign details:', error);
    throw error;
  }
};
