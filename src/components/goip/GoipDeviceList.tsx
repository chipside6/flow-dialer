
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PortStatusBadge } from './PortStatusBadge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

interface GoipDeviceListProps {
  onRefreshNeeded?: () => void;
}

export const GoipDeviceList = ({ onRefreshNeeded }: GoipDeviceListProps) => {
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
      const { data, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        logger.error("Error fetching user trunks:", error);
        throw new Error(`Failed to fetch devices: ${error.message}`);
      }
      
      logger.info("Fetched user trunks successfully:", data?.length || 0, "trunks found");
      console.log("User trunks data:", data); // Log full data for debugging
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5000, // Consider data fresh for only 5 seconds to ensure updates
    retry: 3, // Retry failed queries three times
  });

  // Group trunks by device name
  const deviceGroups = React.useMemo(() => {
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
  const deviceNames = React.useMemo(() => {
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

  useEffect(() => {
    // Log device list state on mount and when data changes
    console.log("GoipDeviceList current state:", {
      isLoading,
      error: error ? (error as Error).message : null,
      userTrunksCount: userTrunks?.length || 0,
      deviceGroupsCount: Object.keys(deviceGroups).length,
      deviceNamesCount: deviceNames.length
    });
  }, [isLoading, error, userTrunks, deviceGroups, deviceNames]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading devices...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Devices</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Failed to load devices"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!deviceNames.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Devices</CardTitle>
          <CardDescription>No devices registered yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Register your first GoIP device using the form above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Your Devices</CardTitle>
            <CardDescription>Manage your registered GoIP devices</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deviceNames.map((deviceName) => {
            const ports = deviceGroups[deviceName];
            const firstPort = ports[0]; // Get info from first port for device metadata
            
            return (
              <Card key={deviceName} className="overflow-hidden border-muted goip-device-card">
                <CardHeader className="pb-2 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{deviceName}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {ports.length} port{ports.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {firstPort?.device_ip && (
                    <CardDescription>{firstPort.device_ip}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Ports</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ports.map(port => (
                        <div 
                          key={port.id} 
                          className="border rounded p-2 flex flex-col text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Port {port.port_number}</span>
                            <PortStatusBadge status={port.status === "active" ? "idle" : "error"} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            SIP: {port.sip_user || "Unknown"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
