
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useInterval } from '@/hooks/useInterval';

interface CallLog {
  id: string;
  phone_number: string;
  status: string;
  duration?: number;
  transfer_requested?: boolean;
  transfer_successful?: boolean;
  created_at: string;
  notes?: string;
}

interface UseCallLogsProps {
  campaignId?: string;
  refreshInterval: number | null;
}

export const useCallLogs = ({ campaignId, refreshInterval = 10000 }: UseCallLogsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchLogs = useCallback(async () => {
    if (!user?.id || !campaignId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching call logs:', err);
      setError(err);
      
      toast({
        title: 'Error fetching call logs',
        description: err.message || 'Failed to load call logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, user?.id, toast]);
  
  // Initial fetch
  useEffect(() => {
    if (campaignId && user?.id) {
      fetchLogs();
    }
  }, [campaignId, user?.id, fetchLogs]);
  
  // Set up polling if refreshInterval is specified
  useInterval(fetchLogs, refreshInterval);
  
  // Manual refresh function
  const refresh = useCallback(() => {
    return fetchLogs();
  }, [fetchLogs]);
  
  return {
    logs,
    isLoading,
    error,
    refresh
  };
};
