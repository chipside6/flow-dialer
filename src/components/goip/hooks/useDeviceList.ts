
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useDeviceList = (onRefreshNeeded?: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userTrunks, setUserTrunks] = useState<any[]>([]);

  const fetchDevices = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    const isInitialLoad = isLoading;
    if (!isInitialLoad) setIsRefreshing(true);
    setError(null);
    
    try {
      console.log("Fetching user trunks for user:", user.id);
      logger.info("Fetching user trunks for user:", user.id);
      
      const { data, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching user trunks:", error);
        logger.error("Error fetching user trunks:", error);
        throw new Error(`Failed to fetch devices: ${error.message}`);
      }
      
      console.log("User trunks data:", data); // Log full data for debugging
      logger.info("Fetched user trunks successfully:", data?.length || 0, "trunks found");
      
      setUserTrunks(data || []);
    } catch (err) {
      console.error("Error in fetchDevices:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch devices'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
  }, [user?.id]);

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
      console.log("Refreshing device list...");
      await fetchDevices();
      
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
