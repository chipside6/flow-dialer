
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
