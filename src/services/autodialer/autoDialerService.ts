
import { supabase } from '@/integrations/supabase/client';

interface StartCampaignParams {
  campaignId: string;
  userId: string;
  portNumbers: number[];
  greetingFileUrl?: string;
  transferNumber?: string;
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
          status: job.status,
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
