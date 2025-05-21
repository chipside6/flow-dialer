
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Phone, Server, Info, AlertCircle } from 'lucide-react';
import { useDeviceList } from './hooks/useDeviceList';
import { LoadingDeviceList } from './list/LoadingDeviceList';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GoipDeviceListProps {
  onRefreshNeeded?: () => void;
}

export const GoipDeviceList: React.FC<GoipDeviceListProps> = ({ onRefreshNeeded }) => {
  const { toast } = useToast();
  const {
    isLoading,
    error,
    deviceNames,
    deviceGroups,
    isRefreshing,
    handleRefresh
  } = useDeviceList(onRefreshNeeded);
  
  const [totalAvailablePorts, setTotalAvailablePorts] = useState(0);
  
  // Calculate total available ports
  useEffect(() => {
    if (!deviceGroups) return;
    
    let count = 0;
    Object.values(deviceGroups).forEach(ports => {
      ports.forEach(port => {
        if (port.status === "active") count++;
      });
    });
    
    setTotalAvailablePorts(count);
  }, [deviceGroups]);

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
          <CardTitle>Available Devices</CardTitle>
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
            <CardTitle>Available Devices</CardTitle>
            <CardDescription className="flex items-center gap-1">
              {totalAvailablePorts > 0 ? (
                <Badge variant="success" className="mr-1">
                  {totalAvailablePorts} {totalAvailablePorts === 1 ? 'port' : 'ports'} available
                </Badge>
              ) : (
                <Badge variant="destructive" className="mr-1">No ports available</Badge>
              )}
            </CardDescription>
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
        {totalAvailablePorts === 0 && (
          <Alert className="mb-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              No available ports detected. Campaigns require active ports to function properly.
              Check your GoIP device connection status or register a new device.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {deviceNames.map((deviceName) => {
            const ports = deviceGroups[deviceName];
            const firstPort = ports[0];
            const availablePorts = ports.filter(port => port.status === "active" || port.status === "available").length;
            
            return (
              <Card key={deviceName} className="overflow-hidden border-muted">
                <CardHeader className="py-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-2 text-primary" />
                      <CardTitle className="text-base">{deviceName}</CardTitle>
                    </div>
                    <Badge variant={availablePorts > 0 ? "success" : "destructive"} className="text-xs">
                      {availablePorts} available {availablePorts === 1 ? 'port' : 'ports'}
                    </Badge>
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
                          port.status === "active" || port.status === "available"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Port {port.port_number} - {port.status === "active" || port.status === "available" ? "Available" : "Busy"}
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
}
