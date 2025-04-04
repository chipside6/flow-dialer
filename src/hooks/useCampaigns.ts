
import { useState, useEffect, useCallback } from 'react';
import { Campaign } from '@/types/campaign';
import { useFetchCampaigns } from '@/hooks/campaigns/useFetchCampaigns';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { fetchCampaigns } = useFetchCampaigns();
  const { user, isAuthenticated } = useAuth();

  const loadCampaigns = useCallback(async () => {
    try {
      if (!isAuthenticated || !user) {
        setCampaigns([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await fetchCampaigns({ 
        user, 
        isAuthenticated 
      });
      
      if (fetchError) {
        throw fetchError;
      }
      
      setCampaigns(data);
    } catch (err: any) {
      console.error('Error loading campaigns:', err);
      setError(err);
      
      // Don't show a toast here, we'll handle it in the component
    } finally {
      setIsLoading(false);
    }
  }, [fetchCampaigns, user, isAuthenticated]);

  // Load campaigns when auth is ready or user changes
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      loadCampaigns().catch(console.error);
    }
  }, [isAuthenticated, loadCampaigns]);

  const refetch = useCallback(async () => {
    try {
      await loadCampaigns();
      return true;
    } catch (err) {
      console.error("Failed to refetch campaigns:", err);
      throw err;
    }
  }, [loadCampaigns]);

  // Alias refetch as refreshCampaigns for backwards compatibility
  const refreshCampaigns = refetch;

  return { campaigns, isLoading, error, refetch, refreshCampaigns };
};

export type { Campaign };
