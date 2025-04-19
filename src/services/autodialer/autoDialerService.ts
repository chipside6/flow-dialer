
import { supabase } from '@/integrations/supabase/client';
import { goipPortManager } from '@/utils/asterisk/services/goipPortManager';

interface CreateJobParams {
  campaignId: string;
  userId: string;
  maxConcurrentCalls?: number;
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
  max_concurrent_calls: number;
  available_ports: number;
}

/**
 * Service for interacting with the autodialer functionality
 */
export const autoDialerService = {
  /**
   * Start a new dialer job for the specified campaign
   */
  async startDialerJob({ campaignId, userId, maxConcurrentCalls = 0 }: CreateJobParams): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      // Get available ports count if maxConcurrentCalls isn't specified
      if (maxConcurrentCalls <= 0) {
        const availablePorts = await goipPortManager.getAvailablePorts(userId, campaignId);
        maxConcurrentCalls = availablePorts.length || 1;
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/autodialer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ campaignId, userId, maxConcurrentCalls })
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
      
      // Reset all ports for this user
      await goipPortManager.resetPorts(userId);

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
  },
  
  /**
   * Make a test call using the first available port
   */
  async makeTestCall(phoneNumber: string, campaignId: string, userId: string): Promise<{ success: boolean; message: string; portNumber?: number }> {
    try {
      // Get an available port
      const availablePorts = await goipPortManager.getAvailablePorts(userId, 'test');
      
      if (availablePorts.length === 0) {
        return {
          success: false,
          message: 'No available GoIP ports found for test call'
        };
      }
      
      // Use the first available port
      const port = availablePorts[0];
      
      // Create a test call ID
      const callId = `test_${Math.random().toString(36).substring(2, 9)}`;
      
      // Mark the port as busy
      await goipPortManager.markPortBusy(userId, port.portNumber, 'test', callId);
      
      // Call the dialer API
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dialer-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          campaignId,
          phoneNumber,
          transferNumber: '12345678', // Default transfer for test
          portNumber: port.portNumber,
          isTest: true
        })
      });
      
      if (!response.ok) {
        // Release the port if call failed
        await goipPortManager.releasePort(userId, port.portNumber);
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.error || `Error making test call: ${response.status}`
        };
      }
      
      const data = await response.json();
      
      // Release the port after 30 seconds (simulating a call)
      setTimeout(async () => {
        await goipPortManager.releasePort(userId, port.portNumber);
        console.log(`Released port ${port.portNumber} after test call`);
      }, 30000);
      
      return {
        success: true,
        message: `Test call initiated to ${phoneNumber} using port ${port.portNumber}`,
        portNumber: port.portNumber
      };
    } catch (error) {
      console.error('Error making test call:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error making test call'
      };
    }
  }
};
