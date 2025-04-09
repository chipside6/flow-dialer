
import { supabase } from '@/integrations/supabase/client';

interface CreateJobParams {
  campaignId: string;
  userId: string;
}

interface DialerJob {
  id: string;
  status: string;
  total_calls: number;
  completed_calls: number;
  successful_calls: number;
  failed_calls: number;
  created_at: string;
  updated_at: string;
}

/**
 * Service for interacting with the autodialer functionality
 */
export const autoDialerService = {
  /**
   * Start a new dialer job for the specified campaign
   */
  async startDialerJob({ campaignId, userId }: CreateJobParams): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/autodialer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ campaignId, userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || `Error starting dialer job: ${response.status}` 
        };
      }

      const data = await response.json();
      return { 
        success: true, 
        jobId: data.jobId 
      };
    } catch (error) {
      console.error('Error starting dialer job:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error starting dialer job' 
      };
    }
  },

  /**
   * Get the status of a dialer job
   */
  async getJobStatus(jobId: string, userId: string): Promise<{ success: boolean; job?: DialerJob; error?: string }> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dialer-status?jobId=${jobId}&userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || `Error getting job status: ${response.status}` 
        };
      }

      const data = await response.json();
      return { 
        success: true, 
        job: data.data[0] 
      };
    } catch (error) {
      console.error('Error getting job status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error getting job status' 
      };
    }
  },

  /**
   * Cancel a running dialer job
   */
  async cancelDialerJob(jobId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Direct update to the dialer_jobs table
      const { error } = await supabase
        .from('dialer_jobs')
        .update({ 
          status: 'cancelled',
          end_time: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('user_id', userId);

      if (error) {
        return { 
          success: false, 
          error: `Error cancelling job: ${error.message}` 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error cancelling dialer job:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error cancelling job' 
      };
    }
  },

  /**
   * Get call logs for a campaign
   */
  async getCallLogs(campaignId: string, userId: string): Promise<{ success: boolean; logs?: any[]; error?: string }> {
    try {
      // Query the call_logs table
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { 
          success: false, 
          error: `Error fetching call logs: ${error.message}` 
        };
      }

      return { 
        success: true, 
        logs: data 
      };
    } catch (error) {
      console.error('Error fetching call logs:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error fetching call logs' 
      };
    }
  }
};
