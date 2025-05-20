
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PortStatusBadge } from './PortStatusBadge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

export const GoipDeviceList = () => {
  const { user } = useAuth();

  // Use query to fetch user trunk data
  const { data: userTrunks, isLoading, refetch } = useQuery({
    queryKey: ['user-trunks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log("Fetching user trunks for user:", user.id);
      const { data, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching user trunks:", error);
        throw error;
      }
      
      console.log("Fetched user trunks:", data);
      return data || [];
    },
    enabled: !!user?.id
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
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
          <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
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
                            <PortStatusBadge status={port.status || "idle"} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            SIP: {port.sip_user}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">Test Connection</Button>
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
