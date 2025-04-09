
import { useState, useEffect } from 'react';
import { usePollingInterval } from '@/hooks/usePollingInterval';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface DialerStatus {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  totalCalls: number;
  completedCalls: number;
  answeredCalls: number;
  transferredCalls: number;
  failedCalls: number;
}

interface UseDialerStatusOptions {
  campaignId: string;
  enabled?: boolean;
  interval?: number;
}

export function useDialerStatus({
  campaignId,
  enabled = true,
  interval = 5000
}: UseDialerStatusOptions) {
  const { user } = useAuth();
  const [status, setStatus] = useState<DialerStatus>({
    status: 'idle',
    totalCalls: 0,
    completedCalls: 0,
    answeredCalls: 0,
    transferredCalls: 0,
    failedCalls: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDialerStatus = async () => {
    if (!user?.id || !campaignId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch the latest job for this campaign
      const { data: jobData, error: jobError } = await supabase
        .from('dialer_jobs')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (jobError) throw jobError;
      
      // Fetch the campaign status
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();
      
      if (campaignError) throw campaignError;
      
      // Update status based on the job and campaign data
      const job = jobData && jobData.length > 0 ? jobData[0] : null;
      const campaign = campaignData;
      
      if (job && ['running', 'pending'].includes(job.status)) {
        setStatus({
          status: 'running',
          totalCalls: job.total_calls || 0,
          completedCalls: job.completed_calls || 0,
          answeredCalls: job.successful_calls || 0,
          transferredCalls: campaign.transferred_calls || 0,
          failedCalls: job.failed_calls || 0
        });
      } else if (job && job.status === 'completed') {
        setStatus({
          status: 'completed',
          totalCalls: job.total_calls || 0,
          completedCalls: job.completed_calls || 0,
          answeredCalls: job.successful_calls || 0,
          transferredCalls: campaign.transferred_calls || 0,
          failedCalls: job.failed_calls || 0
        });
      } else {
        setStatus({
          status: 'idle',
          totalCalls: campaign.total_calls || 0,
          completedCalls: 0,
          answeredCalls: campaign.answered_calls || 0,
          transferredCalls: campaign.transferred_calls || 0,
          failedCalls: campaign.failed_calls || 0
        });
      }
    } catch (err) {
      console.error('Error fetching dialer status:', err);
      setError('Failed to fetch dialer status');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling if enabled
  usePollingInterval(fetchDialerStatus, { 
    enabled, 
    interval 
  });

  return {
    status,
    isLoading,
    error,
    refresh: fetchDialerStatus
  };
}
