
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export const useDeviceList = (onRefreshNeeded?: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use query to fetch user trunk data with better error handling
  const { 
    data: userTrunks, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['user-trunks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      logger.info("Fetching user trunks for user:", user.id);
      console.log("Fetching user trunks for user:", user.id);
      
      const { data, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        logger.error("Error fetching user trunks:", error);
        console.error("Error fetching user trunks:", error);
        throw new Error(`Failed to fetch devices: ${error.message}`);
      }
      
      logger.info("Fetched user trunks successfully:", data?.length || 0, "trunks found");
      console.log("User trunks data:", data); // Log full data for debugging
      return data || [];
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 10000
  });

  // Group trunks by device name
  const deviceGroups = useMemo(() => {
    if (!userTrunks || !Array.isArray(userTrunks) || userTrunks.length === 0) {
      console.log("No user trunks found to group");
      return {};
    }
    
    try {
      const groups: Record<string, any[]> = {};
      userTrunks.forEach(trunk => {
        if (!trunk.trunk_name) {
          console.warn("Found trunk with no name:", trunk);
          return;
        }
        
        if (!groups[trunk.trunk_name]) {
          groups[trunk.trunk_name] = [];
        }
        groups[trunk.trunk_name].push(trunk);
      });
      
      console.log("Device groups created:", Object.keys(groups).length);
      return groups;
    } catch (err) {
      console.error("Error grouping trunks:", err);
      return {};
    }
  }, [userTrunks]);

  // Get array of device names
  const deviceNames = useMemo(() => {
    const names = Object.keys(deviceGroups);
    console.log("Device names found:", names);
    return names;
  }, [deviceGroups]);

  // Handle refresh with loading state
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      console.log("Refreshing device list...");
      await refetch();
      
      // Also trigger parent refresh if provided
      if (onRefreshNeeded) {
        onRefreshNeeded();
      }
      
      toast({
        title: "Device list refreshed",
        description: "Your device list has been updated with the latest information.",
      });
    } catch (err) {
      console.error("Error refreshing device list:", err);
      toast({
        title: "Refresh failed",
        description: "Failed to refresh device list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isLoading,
    error,
    deviceNames,
    deviceGroups,
    isRefreshing,
    handleRefresh
  };
};
