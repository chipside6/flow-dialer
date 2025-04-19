
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PortStatusBadge } from '@/components/goip/PortStatusBadge';
import { Loader2, Server } from 'lucide-react';

interface GoipDevice {
  id: string;
  device_name: string;
  ip_address: string;
}

interface GoipPort {
  id: string;
  port_number: number;
  status: 'available' | 'busy' | 'error';
}

interface GoipDeviceStepProps {
  selectedDeviceId: string;
  selectedPortIds: string[];
  onDeviceChange: (deviceId: string) => void;
  onPortsChange: (portIds: string[]) => void;
}

export const GoipDeviceStep = ({
  selectedDeviceId,
  selectedPortIds,
  onDeviceChange,
  onPortsChange,
}: GoipDeviceStepProps) => {
  const { data: devices, isLoading: isLoadingDevices } = useQuery({
    queryKey: ['goip-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goip_devices')
        .select('*');
      if (error) throw error;
      return data as GoipDevice[];
    }
  });

  const { data: ports, isLoading: isLoadingPorts } = useQuery({
    queryKey: ['goip-ports', selectedDeviceId],
    queryFn: async () => {
      if (!selectedDeviceId) return [];
      const { data, error } = await supabase
        .from('goip_ports')
        .select('*')
        .eq('device_id', selectedDeviceId);
      if (error) throw error;
      return data as GoipPort[];
    },
    enabled: !!selectedDeviceId
  });

  const availablePorts = ports?.filter(port => port.status === 'available') || [];

  const handleTogglePort = (portId: string) => {
    const newSelectedPorts = selectedPortIds.includes(portId)
      ? selectedPortIds.filter(id => id !== portId)
      : [...selectedPortIds, portId];
    onPortsChange(newSelectedPorts);
  };

  const handleSelectAllPorts = () => {
    onPortsChange(availablePorts.map(port => port.id));
  };

  const handleClearPortSelection = () => {
    onPortsChange([]);
  };

  if (isLoadingDevices) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Select GoIP Device</Label>
        <Select value={selectedDeviceId} onValueChange={onDeviceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a device" />
          </SelectTrigger>
          <SelectContent>
            {devices?.map(device => (
              <SelectItem key={device.id} value={device.id}>
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span>{device.device_name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDeviceId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Available Ports</Label>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllPorts}
                disabled={availablePorts.length === 0}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearPortSelection}
                disabled={selectedPortIds.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {isLoadingPorts ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ports?.map(port => (
                <Card key={port.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedPortIds.includes(port.id)}
                          onCheckedChange={() => handleTogglePort(port.id)}
                          disabled={port.status !== 'available'}
                        />
                        <span>Port {port.port_number}</span>
                      </div>
                      <PortStatusBadge status={port.status === 'available' ? 'idle' : 'in-call'} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
