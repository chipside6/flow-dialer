
import { supabase } from '@/integrations/supabase/client';

export const callRetryManager = {
  /**
   * Retry failed calls with exponential backoff
   */
  retryFailedCalls: async (jobId: string, maxRetries = 3): Promise<{
    success: boolean;
    retriedCount: number;
    error?: string;
  }> => {
    try {
      // Get failed calls that haven't reached max retry attempts
      const { data: failedCalls, error } = await supabase
        .from('dialer_queue')
        .select('*')
        .eq('job_id', jobId)
        .eq('status', 'failed')
        .lt('attempts', maxRetries);

      if (error) throw error;

      if (!failedCalls || failedCalls.length === 0) {
        return { success: true, retriedCount: 0 };
      }

      // Re-queue each failed call with exponential backoff and capped backoff time
      const updates = await Promise.all(failedCalls.map(call => {
        const attempts = call.attempts + 1;
        let backoffMinutes = Math.pow(2, attempts); // Exponential backoff: 2, 4, 8 minutes

        // Cap backoff time to a maximum of 1 hour
        backoffMinutes = Math.min(backoffMinutes, 60);

        // Calculate next attempt time with backoff
        const nextAttemptTime = new Date();
        nextAttemptTime.setMinutes(nextAttemptTime.getMinutes() + backoffMinutes);

        return supabase
          .from('dialer_queue')
          .update({
            status: 'queued',
            attempts: attempts,
            last_attempt: new Date().toISOString(),
            next_attempt: nextAttemptTime.toISOString()
          })
          .eq('id', call.id);
      }));

      // Check for any errors during update
      const errors = updates.filter(update => update.error);
      if (errors.length > 0) {
        console.error('Some retry updates failed:', errors);
      }

      // Mark calls as permanently failed if retries are exhausted
      const permanentlyFailedCalls = failedCalls.filter(call => call.attempts >= maxRetries);
      if (permanentlyFailedCalls.length > 0) {
        await supabase
          .from('dialer_queue')
          .update({ status: 'permanently_failed' })
          .in('id', permanentlyFailedCalls.map(call => call.id));
      }

      return {
        success: errors.length === 0,
        retriedCount: failedCalls.length,
        error: errors.length > 0 ? 'Some retry updates failed' : undefined
      };

    } catch (error) {
      console.error('Error retrying failed calls:', error);
      return {
        success: false,
        retriedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error retrying calls'
      };
    }
  },

  /**
   * Schedule automatic retries for a specific job
   */
  scheduleAutoRetries: async (jobId: string, intervalMinutes = 15): Promise<boolean> => {
    try {
      // This is a simplified version; in production you'd use a proper
      // scheduler or edge function to handle this

      const intervalId = setInterval(async () => {
        // Check if job is still active
        const { data: job } = await supabase
          .from('dialer_jobs')
          .select('status')
          .eq('id', jobId)
          .single();

        if (job?.status !== 'running') {
          // Job is no longer running, clear the interval
          clearInterval(intervalId);
          return;
        }

        // Retry failed calls
        await callRetryManager.retryFailedCalls(jobId);

      }, intervalMinutes * 60 * 1000);

      // Store the interval ID to clear it later if needed
      sessionStorage.setItem(`retry_interval_${jobId}`, intervalId.toString());

      return true;
    } catch (error) {
      console.error('Error scheduling auto retries:', error);
      return false;
    }
  },

  /**
   * Stop the automatic retry scheduler
   */
  stopAutoRetries: (jobId: string): boolean => {
    try {
      const intervalIdStr = sessionStorage.getItem(`retry_interval_${jobId}`);
      if (intervalIdStr) {
        clearInterval(parseInt(intervalIdStr));
        sessionStorage.removeItem(`retry_interval_${jobId}`);
      }
      return true;
    } catch (error) {
      console.error('Error stopping auto retries:', error);
      return false;
    }
  }
};
