
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PortDisplay } from './PortDisplay';

interface DeviceCardProps {
  deviceName: string;
  ports: any[];
  firstPort: any;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ deviceName, ports, firstPort }) => {
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
              <PortDisplay key={port.id} port={port} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
