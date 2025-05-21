
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Phone, Server } from 'lucide-react';
import { useDeviceList } from './hooks/useDeviceList';
import { LoadingDeviceList } from './list/LoadingDeviceList';

interface GoipDeviceListProps {
  onRefreshNeeded?: () => void;
}

export const GoipDeviceList: React.FC<GoipDeviceListProps> = ({ onRefreshNeeded }) => {
  const {
    isLoading,
    error,
    deviceNames,
    deviceGroups,
    isRefreshing,
    handleRefresh
  } = useDeviceList(onRefreshNeeded);

  if (isLoading) {
    return <LoadingDeviceList />;
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

  if (!deviceNames || deviceNames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Devices</CardTitle>
          <CardDescription>No devices registered yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Register your first GoIP device using the form on the left.
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
            <CardDescription>Registered GoIP devices</CardDescription>
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
        <div className="space-y-3">
          {deviceNames.map((deviceName) => {
            const ports = deviceGroups[deviceName];
            const firstPort = ports[0]; // Get info from first port for device metadata
            
            return (
              <Card key={deviceName} className="overflow-hidden border-muted">
                <CardHeader className="py-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-2 text-primary" />
                      <CardTitle className="text-base">{deviceName}</CardTitle>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ports.length} {ports.length === 1 ? 'port' : 'ports'}
                    </div>
                  </div>
                  {firstPort?.device_ip && (
                    <CardDescription className="mt-1 text-xs">IP: {firstPort.device_ip}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="py-3 px-3">
                  <div className="flex flex-wrap gap-2">
                    {ports.map(port => (
                      <div 
                        key={port.id} 
                        className={`text-xs px-3 py-1.5 rounded-full flex items-center ${
                          port.status === "active" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Port {port.port_number}
                      </div>
                    ))}
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
