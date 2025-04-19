
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface CampaignStats {
  total_calls: number;
  answered_calls: number;
  transferred_calls: number;
  failed_calls: number;
  progress: number;
  status: string;
}

export function useCampaignRealtime(campaignId: string) {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    // Initial fetch of campaign stats
    const fetchCampaignStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('campaigns')
          .select('total_calls, answered_calls, transferred_calls, failed_calls, progress, status')
          .eq('id', campaignId)
          .single();

        if (error) throw error;
        
        setStats(data);
      } catch (err) {
        console.error('Error fetching campaign stats:', err);
        setError('Failed to load campaign statistics');
        toast({
          title: 'Error',
          description: 'Failed to load campaign statistics',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignStats();

    // Set up real-time subscription to campaign updates
    const channel = supabase
      .channel(`campaign-${campaignId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'campaigns',
          filter: `id=eq.${campaignId}` 
        },
        (payload) => {
          console.log('Campaign update received:', payload.new);
          setStats(payload.new as CampaignStats);
          
          // Show toast notification for important status changes
          if (payload.old.status !== payload.new.status) {
            toast({
              title: 'Campaign Status Update',
              description: `Status changed from ${payload.old.status} to ${payload.new.status}`,
            });
          }
        }
      )
      .subscribe();

    // Also subscribe to call logs for this campaign
    const callLogsChannel = supabase
      .channel(`call-logs-${campaignId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'call_logs',
          filter: `campaign_id=eq.${campaignId}` 
        },
        (payload) => {
          console.log('New call log:', payload.new);
          
          // Show toast for important call events
          if (payload.new.status === 'transfer_successful') {
            toast({
              title: 'Call Transferred',
              description: `Call to ${payload.new.phone_number} was successfully transferred`,
            });
          } else if (payload.new.status === 'failed') {
            toast({
              title: 'Call Failed',
              description: `Call to ${payload.new.phone_number} failed: ${payload.new.notes || 'Unknown reason'}`,
              variant: 'destructive',
            });
          }
        }
      )
      .subscribe();

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(callLogsChannel);
    };
  }, [campaignId]);

  return { stats, isLoading, error };
}
