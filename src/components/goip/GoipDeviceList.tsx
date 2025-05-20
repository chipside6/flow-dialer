
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
      
      logger.info("Fetched user trunks:", data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 30000, // Data considered fresh for 30 seconds
    retry: 2, // Retry failed queries twice
  });

  // Group trunks by device name
  const deviceGroups = React.useMemo(() => {
    if (!userTrunks) return {};
    
    const groups: Record<string, any[]> = {};
    userTrunks.forEach(trunk => {
      if (!groups[trunk.trunk_name]) {
        groups[trunk.trunk_name] = [];
      }
      groups[trunk.trunk_name].push(trunk);
    });
    
    return groups;
  }, [userTrunks]);

  // Get array of device names
  const deviceNames = React.useMemo(() => {
    return Object.keys(deviceGroups);
  }, [deviceGroups]);

  // Handle refresh with loading state
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
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
      toast({
        title: "Refresh failed",
        description: "Failed to refresh device list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

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
              <Card key={deviceName} className="overflow-hidden">
                <CardHeader className="pb-2 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{deviceName}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {ports.length} port{ports.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {firstPort.device_ip && (
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
                            SIP: {port.sip_user}
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
