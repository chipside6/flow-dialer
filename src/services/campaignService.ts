import { supabase } from '@/integrations/supabase/client';

export type CampaignStatusType = 'pending' | 'running' | 'completed' | 'failed' | 'stopped';

export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: CampaignStatusType;
  greeting_file_url?: string;
  transfer_number?: string;
  port_number?: number;
  created_at: string;
  contact_list_id?: string;
  [key: string]: any;
}

/**
 * Check if GoIP device is online for a specific port
 */
export const checkGoipStatus = async (
  userId: string, 
  portNumber: number = 1
): Promise<{ online: boolean; message: string; lastSeen?: string | null }> => {
  try {
    // Get authentication session
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.access_token) {
      throw new Error('Authentication required');
    }
    
    // Call the edge function to check status
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/goip-asterisk-integration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.session.access_token}`
      },
      body: JSON.stringify({
        userId,
        action: 'check_status'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error checking GoIP status: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error checking GoIP status');
    }
    
    // Find the status for the specific port
    const portStatus = result.statuses?.find((s: any) => s.port === portNumber);
    
    if (!portStatus) {
      return {
        online: false,
        message: `No information available for port ${portNumber}`
      };
    }
    
    return {
      online: portStatus.status === 'registered',
      message: portStatus.status === 'registered' 
        ? `Port ${portNumber} is online and registered` 
        : `Port ${portNumber} is offline or not registered`,
      lastSeen: portStatus.lastSeen
    };
  } catch (error) {
    console.error('Error checking GoIP status:', error);
    return {
      online: false,
      message: error instanceof Error ? error.message : 'Unknown error checking GoIP status'
    };
  }
};

/**
 * Start a campaign
 */
export const startCampaign = async (campaignId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (campaignError || !campaign) {
      throw new Error(campaignError?.message || 'Campaign not found');
    }
    
    // Update campaign status
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', campaignId);
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    return {
      success: true,
      message: 'Campaign started successfully'
    };
  } catch (error) {
    console.error('Error starting campaign:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error starting campaign'
    };
  }
};

/**
 * Stop a campaign
 */
export const stopCampaign = async (campaignId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Update campaign status
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        status: 'stopped',
        stopped_at: new Date().toISOString()
      })
      .eq('id', campaignId);
    
    if (updateError) {
      throw new Error(updateError.message);
    }
    
    return {
      success: true,
      message: 'Campaign stopped successfully'
    };
  } catch (error) {
    console.error('Error stopping campaign:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error stopping campaign'
    };
  }
};

/**
 * Pause a campaign
 */
export const pauseCampaign = async (campaignId: string): Promise<void> => {
  try {
    // Update campaign status
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        status: 'paused',
        paused_at: new Date().toISOString()
      })
      .eq('id', campaignId);
    
    if (updateError) {
      throw new Error(updateError.message);
    }
  } catch (error) {
    console.error('Error pausing campaign:', error);
    throw error;
  }
};

/**
 * Resume a campaign
 */
export const resumeCampaign = async (campaignId: string): Promise<void> => {
  try {
    // Update campaign status
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        status: 'running',
        resumed_at: new Date().toISOString()
      })
      .eq('id', campaignId);
    
    if (updateError) {
      throw new Error(updateError.message);
    }
  } catch (error) {
    console.error('Error resuming campaign:', error);
    throw error;
  }
};

/**
 * Start a test call
 */
export const startTestCall = async (campaignId: string, phoneNumber: string): Promise<void> => {
  try {
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (campaignError || !campaign) {
      throw new Error(campaignError?.message || 'Campaign not found');
    }
    
    console.log(`Starting test call for campaign ${campaignId} to ${phoneNumber}`);
    
    // Call makeTestCall with the appropriate parameters
    await makeTestCall(
      campaign.user_id, 
      phoneNumber, 
      campaign.transfer_number || '',
      campaign.port_number || 1,
      campaign.greeting_file_url
    );
  } catch (error) {
    console.error('Error starting test call:', error);
    throw error;
  }
};

/**
 * Make a test call
 */
export const makeTestCall = async (
  userId: string,
  phoneNumber: string,
  transferNumber: string,
  portNumber: number = 1,
  greetingFileUrl?: string
): Promise<{ success: boolean; message: string; callId?: string }> => {
  try {
    // Get authentication session
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.access_token) {
      throw new Error('Authentication required');
    }
    
    // Call the edge function to make a test call
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dialer-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.session.access_token}`
      },
      body: JSON.stringify({
        campaignId: 'test',
        phoneNumber,
        transferNumber,
        greetingFileUrl,
        portNumber,
        isTest: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error making test call: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return {
      success: result.success || false,
      message: result.message || 'Test call initiated',
      callId: result.callId
    };
  } catch (error) {
    console.error('Error making test call:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error making test call'
    };
  }
};
