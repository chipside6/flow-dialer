
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useDeviceList } from './hooks/useDeviceList';

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

  if (!deviceNames || deviceNames.length === 0) {
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
                            <span className={`text-xs px-2 py-1 rounded ${port.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {port.status === "active" ? "Available" : "Error"}
                            </span>
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
