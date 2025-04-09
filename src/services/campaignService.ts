
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
    
    toast({
      title: "Campaign Paused",
      description: "The campaign has been paused successfully."
    });
    
    return data;
  } catch (error) {
    console.error('Error pausing campaign:', error);
    toast({
      title: "Error Pausing Campaign",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive"
    });
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
    
    toast({
      title: "Campaign Resumed",
      description: "The campaign has been resumed successfully."
    });
    
    return data;
  } catch (error) {
    console.error('Error resuming campaign:', error);
    toast({
      title: "Error Resuming Campaign",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive"
    });
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
    
    toast({
      title: "Campaign Stopped",
      description: "The campaign has been stopped successfully."
    });
    
    return data;
  } catch (error) {
    console.error('Error stopping campaign:', error);
    toast({
      title: "Error Stopping Campaign",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Start a test call for a campaign
 * @param campaignId The ID of the campaign to test
 * @param phoneNumber The phone number to call
 * @returns A Promise resolving to the result of the test call
 */
export const startTestCall = async (campaignId: string, phoneNumber: string) => {
  try {
    // Get the campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        user_id
      `)
      .eq('id', campaignId)
      .single();
      
    if (campaignError) throw campaignError;
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    
    // Get the user's GoIP trunk
    const { data: trunks, error: trunksError } = await supabase
      .from('user_trunks')
      .select('*')
      .eq('user_id', campaign.user_id)
      .eq('port_number', campaign.port_number || 1)
      .limit(1);
      
    if (trunksError) throw trunksError;
    
    if (!trunks || trunks.length === 0) {
      throw new Error('No GoIP trunk found for this user. Please configure your GoIP device first.');
    }
    
    // Call the dialer-api endpoint
    const { data: session } = await supabase.auth.getSession();
    const accessToken = session.session?.access_token;
    
    if (!accessToken) {
      throw new Error('You must be logged in to make a test call');
    }
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dialer-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        campaignId: campaign.id,
        phoneNumber: phoneNumber,
        transferNumber: campaign.transfer_number,
        greetingFileUrl: campaign.greeting_file_url,
        portNumber: campaign.port_number || 1,
        isTest: true // Indicate this is a test call
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error making test call: ${response.status}`);
    }
    
    const result = await response.json();
    
    toast({
      title: "Test Call Initiated",
      description: `A test call to ${phoneNumber} has been initiated. Please answer your phone.`
    });
    
    return result;
  } catch (error) {
    console.error('Error making test call:', error);
    toast({
      title: "Error Making Test Call",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Check the status of a GoIP trunk
 * @param userId The ID of the user
 * @param portNumber The port number to check
 * @returns A Promise resolving to the status of the GoIP trunk
 */
export const checkGoipStatus = async (userId: string, portNumber: number = 1) => {
  try {
    // Get the user's GoIP trunk
    const { data: trunks, error: trunksError } = await supabase
      .from('user_trunks')
      .select('*')
      .eq('user_id', userId)
      .eq('port_number', portNumber)
      .limit(1);
      
    if (trunksError) throw trunksError;
    
    if (!trunks || trunks.length === 0) {
      return { online: false, message: 'No GoIP trunk configured' };
    }
    
    // Call the goip-asterisk-integration endpoint to check status
    const { data: session } = await supabase.auth.getSession();
    const accessToken = session.session?.access_token;
    
    if (!accessToken) {
      throw new Error('You must be logged in to check GoIP status');
    }
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/goip-asterisk-integration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userId,
        action: 'check_status'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error checking GoIP status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Find the status for the specific port
    const portStatus = result.statuses?.find((s: any) => s.port === portNumber);
    
    return { 
      online: portStatus?.status === 'registered',
      message: portStatus?.status === 'registered' ? 'Online' : 'Offline',
      lastSeen: portStatus?.lastSeen || null
    };
  } catch (error) {
    console.error('Error checking GoIP status:', error);
    return { 
      online: false, 
      message: error instanceof Error ? error.message : "An error occurred checking GoIP status"
    };
  }
};
