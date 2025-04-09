
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { autoDialerService } from '@/services/autodialer/autoDialerService';
import { toast } from '@/components/ui/use-toast';

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

interface UseDialerJobsResult {
  startJob: (campaignId: string) => Promise<string | null>;
  cancelJob: (jobId: string) => Promise<boolean>;
  getCurrentJob: (campaignId: string) => Promise<DialerJob | null>;
  getJobStatus: (jobId: string) => Promise<DialerJob | null>;
  isLoading: boolean;
  currentJob: DialerJob | null;
  error: string | null;
}

export const useDialerJobs = (campaignId?: string): UseDialerJobsResult => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentJob, setCurrentJob] = useState<DialerJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load the current job for the campaign if campaignId is provided
  useEffect(() => {
    if (campaignId && user?.id) {
      loadCurrentJob(campaignId);
    }
  }, [campaignId, user?.id]);

  // Load the current/latest job for the campaign
  const loadCurrentJob = async (campaignId: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('dialer_jobs')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setCurrentJob(data[0] as DialerJob);
      } else {
        setCurrentJob(null);
      }
    } catch (err) {
      console.error('Error loading current job:', err);
      setError('Failed to load current job');
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new dialer job
  const startJob = async (campaignId: string): Promise<string | null> => {
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to start a dialer job',
        variant: 'destructive'
      });
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await autoDialerService.startDialerJob({
        campaignId,
        userId: user.id
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: 'Dialer job started',
        description: 'The system is now making calls for your campaign'
      });
      
      // Reload the current job
      await loadCurrentJob(campaignId);
      
      return result.jobId || null;
    } catch (err) {
      console.error('Error starting dialer job:', err);
      setError(err instanceof Error ? err.message : 'Failed to start dialer job');
      
      toast({
        title: 'Failed to start dialer job',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel a running dialer job
  const cancelJob = async (jobId: string): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to cancel a dialer job',
        variant: 'destructive'
      });
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await autoDialerService.cancelDialerJob(jobId, user.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: 'Dialer job cancelled',
        description: 'The dialer job has been cancelled successfully'
      });
      
      // Reload the current job if we have a campaign ID
      if (campaignId) {
        await loadCurrentJob(campaignId);
      }
      
      return true;
    } catch (err) {
      console.error('Error cancelling dialer job:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel dialer job');
      
      toast({
        title: 'Failed to cancel dialer job',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get the current/latest job for a campaign
  const getCurrentJob = async (campaignId: string): Promise<DialerJob | null> => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('dialer_jobs')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data[0] as DialerJob;
      }
      
      return null;
    } catch (err) {
      console.error('Error getting current job:', err);
      return null;
    }
  };

  // Get the status of a specific job
  const getJobStatus = async (jobId: string): Promise<DialerJob | null> => {
    if (!user?.id) return null;
    
    try {
      const result = await autoDialerService.getJobStatus(jobId, user.id);
      
      if (!result.success || !result.job) {
        return null;
      }
      
      return result.job;
    } catch (err) {
      console.error('Error getting job status:', err);
      return null;
    }
  };

  return {
    startJob,
    cancelJob,
    getCurrentJob,
    getJobStatus,
    isLoading,
    currentJob,
    error
  };
};
