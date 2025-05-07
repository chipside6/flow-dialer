
import { supabase } from '@/integrations/supabase/client';

interface StartCampaignParams {
  campaignId: string;
  userId: string;
  portNumbers: number[];
  greetingFileUrl?: string;
  transferNumber?: string;
}

interface StartDialerJobParams {
  campaignId: string;
  userId: string;
  maxConcurrentCalls?: number;
}

interface CampaignStatus {
  id: string;
  status: 'pending' | 'starting' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed';
  totalCalls: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
}

/**
 * Service for interacting with the autodialer functionality
 */
export const autoDialerService = {
  /**
   * Start a campaign with the autodialer
   */
  async startCampaign({
    campaignId,
    userId,
    portNumbers,
    greetingFileUrl,
    transferNumber
  }: StartCampaignParams): Promise<{ success: boolean; message: string; jobId?: string }> {
    try {
      // Call the autodialer edge function
      const { data, error } = await supabase.functions.invoke('autodialer', {
        body: {
          campaignId,
          userId,
          portNumbers,
          greetingFileUrl,
          transferNumber
        }
      });

      if (error) {
        console.error('Error calling autodialer:', error);
        return {
          success: false,
          message: `Error starting campaign: ${error.message}`
        };
      }

      if (!data?.success) {
        return {
          success: false,
          message: data?.message || 'Unknown error starting campaign'
        };
      }

      return {
        success: true,
        message: 'Campaign started successfully',
        jobId: data.job?.id
      };
    } catch (error) {
      console.error('Error in startCampaign:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error starting campaign'
      };
    }
  },

  /**
   * Start a dialer job (alias for startCampaign for compatibility)
   */
  async startDialerJob({
    campaignId,
    userId,
    maxConcurrentCalls
  }: StartDialerJobParams): Promise<{ success: boolean; message?: string; error?: string; jobId?: string }> {
    try {
      // Get available ports for this user
      const { data: ports } = await supabase
        .rpc('get_port_status', { user_id_param: userId });

      const availablePorts = ports?.filter(p => p.status === 'available') || [];
      
      if (availablePorts.length === 0) {
        return {
          success: false,
          error: 'No available ports found'
        };
      }
      
      // Use either provided max or all available ports
      const portCount = maxConcurrentCalls || availablePorts.length;
      const portsToUse = availablePorts.slice(0, portCount).map(p => p.port_number);
      
      const result = await this.startCampaign({
        campaignId,
        userId,
        portNumbers: portsToUse
      });
      
      return {
        success: result.success,
        message: result.message,
        error: result.success ? undefined : result.message,
        jobId: result.jobId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error starting dialer job'
      };
    }
  },

  /**
   * Get the status of a campaign
   */
  async getCampaignStatus(jobId: string): Promise<{ success: boolean; status?: CampaignStatus; message?: string }> {
    try {
      const { data: job, error } = await supabase
        .from('dialer_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        return {
          success: false,
          message: `Error getting job status: ${error.message}`
        };
      }

      return {
        success: true,
        status: {
          id: job.id,
          status: job.status as 'pending' | 'starting' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed',
          totalCalls: job.total_calls,
          completedCalls: job.completed_calls || 0,
          successfulCalls: job.successful_calls || 0,
          failedCalls: job.failed_calls || 0
        }
      };
    } catch (error) {
      console.error('Error getting campaign status:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error getting campaign status'
      };
    }
  },

  /**
   * Get job status (alias for getCampaignStatus for compatibility)
   */
  async getJobStatus(jobId: string, userId?: string): Promise<{ success: boolean; job?: any; error?: string }> {
    try {
      const result = await this.getCampaignStatus(jobId);
      
      if (!result.success) {
        return {
          success: false,
          error: result.message
        };
      }
      
      return {
        success: true,
        job: result.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting job status'
      };
    }
  },

  /**
   * Cancel a running campaign
   */
  async cancelCampaign(jobId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Update job status to cancelled
      const { error } = await supabase
        .from('dialer_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId);

      if (error) {
        return {
          success: false,
          message: `Error cancelling campaign: ${error.message}`
        };
      }

      // Reset port status
      await supabase
        .from('user_trunks')
        .update({ 
          status: 'available', 
          current_campaign_id: null 
        })
        .eq('user_id', userId)
        .eq('current_campaign_id', jobId);

      return {
        success: true,
        message: 'Campaign cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error cancelling campaign'
      };
    }
  },

  /**
   * Cancel a dialer job (alias for cancelCampaign for compatibility)
   */
  async cancelDialerJob(jobId: string, userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const result = await this.cancelCampaign(jobId, userId);
      
      return {
        success: result.success,
        message: result.message,
        error: result.success ? undefined : result.message
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error cancelling job'
      };
    }
  },

  /**
   * Make a test call for a campaign
   */
  async makeTestCall(phoneNumber: string, campaignId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Call the test call edge function
      const { data, error } = await supabase.functions.invoke('make-test-call', {
        body: {
          phoneNumber,
          campaignId,
          userId
        }
      });

      if (error) {
        return {
          success: false,
          message: `Error making test call: ${error.message}`
        };
      }

      return {
        success: data?.success || false,
        message: data?.message || 'Test call initiated'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error making test call'
      };
    }
  },

  /**
   * Get call logs for a campaign
   */
  async getCallLogs(campaignId: string): Promise<{ success: boolean; logs?: any[]; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          message: `Error getting call logs: ${error.message}`
        };
      }

      return {
        success: true,
        logs: data
      };
    } catch (error) {
      console.error('Error getting call logs:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error getting call logs'
      };
    }
  }
};
