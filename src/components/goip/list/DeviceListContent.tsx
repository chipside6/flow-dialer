
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { LoadingDeviceList } from './LoadingDeviceList';
import { ErrorDeviceList } from './ErrorDeviceList';
import { EmptyDeviceList } from './EmptyDeviceList';
import { DeviceCard } from './DeviceCard';
import { useDeviceList } from '../hooks/useDeviceList';

interface DeviceListContentProps {
  onRefreshNeeded?: () => void;
}

export const DeviceListContent: React.FC<DeviceListContentProps> = ({ onRefreshNeeded }) => {
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
    return <ErrorDeviceList error={error} onRetry={handleRefresh} />;
  }

  if (!deviceNames.length) {
    return <EmptyDeviceList />;
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
              <DeviceCard 
                key={deviceName} 
                deviceName={deviceName} 
                ports={ports} 
                firstPort={firstPort} 
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
