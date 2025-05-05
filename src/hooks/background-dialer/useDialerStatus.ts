
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
    failedCalls: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDialerStatus = async () => {
    if (!user?.id || !campaignId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: jobData, error: jobError } = await supabase
        .from('dialer_jobs')
        .select('status, total_calls, completed_calls, successful_calls, failed_calls')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (jobError) throw new Error(`Job fetch error: ${jobError.message}`);

      const job = jobData?.[0];

      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('total_calls, answered_calls, transferred_calls, failed_calls')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();

      if (campaignError) throw new Error(`Campaign fetch error: ${campaignError.message}`);

      const buildStatus = (
        status: DialerStatus['status'],
        jobMetrics?: {
          totalCalls?: number,
          completedCalls?: number,
          answeredCalls?: number,
          failedCalls?: number
        },
        campaignMetrics?: {
          totalCalls?: number,
          answeredCalls?: number,
          transferredCalls?: number,
          failedCalls?: number
        }
      ): DialerStatus => ({
        status,
        totalCalls: jobMetrics?.totalCalls ?? campaignMetrics?.totalCalls ?? 0,
        completedCalls: jobMetrics?.completedCalls ?? 0,
        answeredCalls: jobMetrics?.answeredCalls ?? campaignMetrics?.answeredCalls ?? 0,
        transferredCalls: campaignMetrics?.transferredCalls ?? 0,
        failedCalls: jobMetrics?.failedCalls ?? campaignMetrics?.failedCalls ?? 0,
      });

      if (job) {
        if (['running', 'pending'].includes(job.status)) {
          setStatus(buildStatus('running', {
            totalCalls: job.total_calls ?? 0,
            completedCalls: job.completed_calls ?? 0,
            answeredCalls: job.successful_calls ?? 0,
            failedCalls: job.failed_calls ?? 0,
          }, {
            transferredCalls: campaign.transferred_calls ?? 0,
          }));
        } else if (job.status === 'completed') {
          setStatus(buildStatus('completed', {
            totalCalls: job.total_calls ?? 0,
            completedCalls: job.completed_calls ?? 0,
            answeredCalls: job.successful_calls ?? 0,
            failedCalls: job.failed_calls ?? 0,
          }, {
            transferredCalls: campaign.transferred_calls ?? 0,
          }));
        } else {
          setStatus(buildStatus('idle', undefined, {
            totalCalls: campaign.total_calls,
            answeredCalls: campaign.answered_calls,
            transferredCalls: campaign.transferred_calls,
            failedCalls: campaign.failed_calls
          }));
        }
      } else {
        setStatus(buildStatus('idle', undefined, {
          totalCalls: campaign.total_calls,
          answeredCalls: campaign.answered_calls,
          transferredCalls: campaign.transferred_calls,
          failedCalls: campaign.failed_calls
        }));
      }

    } catch (err: any) {
      console.error('Dialer status fetch failed:', err);
      setError(err.message || 'Failed to fetch dialer status');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling if enabled
  usePollingInterval(fetchDialerStatus, { enabled, interval });

  return {
    status,
    isLoading,
    error,
    refresh: fetchDialerStatus,
  };
}
