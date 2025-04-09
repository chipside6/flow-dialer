
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export interface CallLog {
  id: string;
  campaign_id: string;
  user_id: string;
  phone_number: string;
  status: string;
  duration: number;
  transfer_requested: boolean;
  transfer_successful: boolean;
  notes: string;
  created_at: string;
}

interface UseCallLogsProps {
  campaignId?: string;
  limit?: number;
  refreshInterval?: number | null;
}

export const useCallLogs = ({ 
  campaignId, 
  limit = 100,
  refreshInterval = null 
}: UseCallLogsProps = {}) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    human: 0,
    voicemail: 0,
    failed: 0,
    transfers: 0
  });

  // Load logs and set up refresh interval if enabled
  useEffect(() => {
    if (user?.id) {
      fetchLogs();
      
      // Set up refresh interval if specified
      if (refreshInterval) {
        const intervalId = setInterval(fetchLogs, refreshInterval);
        return () => clearInterval(intervalId);
      }
    }
  }, [user?.id, campaignId, limit, refreshInterval]);

  // Fetch call logs from the database
  const fetchLogs = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the typed query to call_logs table
      let query = supabase
        .from('call_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      // Add campaign filter if provided
      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        setLogs(data as CallLog[]);
        calculateStats(data as CallLog[]);
      }
    } catch (err) {
      console.error('Error fetching call logs:', err);
      setError('Failed to load call logs');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics from call logs
  const calculateStats = (logs: CallLog[]) => {
    const newStats = {
      total: logs.length,
      human: 0,
      voicemail: 0,
      failed: 0,
      transfers: 0
    };
    
    logs.forEach(log => {
      if (log.status === 'human') {
        newStats.human += 1;
      } else if (log.status === 'voicemail') {
        newStats.voicemail += 1;
      } else if (['failed', 'error', 'busy', 'noanswer'].includes(log.status)) {
        newStats.failed += 1;
      }
      
      if (log.transfer_requested) {
        newStats.transfers += 1;
      }
    });
    
    setStats(newStats);
  };

  return {
    logs,
    isLoading,
    error,
    stats,
    refresh: fetchLogs
  };
};
