
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Badge } from '@/components/ui/badge';
import { AddPortDialog } from './AddPortDialog';

interface GoipDevice {
  id: string;
  device_name: string;
  ip_address: string;
  ports: Array<{
    id: string;
    port_number: number;
    sip_username: string;
    status: string;
  }>;
}

export const GoipDeviceList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<GoipDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    if (!user?.id) return;

    try {
      const { data: devicesData, error: devicesError } = await supabase
        .from('goip_devices')
        .select('*')
        .eq('user_id', user.id);

      if (devicesError) throw devicesError;

      const devicesWithPorts = await Promise.all(
        devicesData.map(async (device) => {
          const { data: portsData } = await supabase
            .from('goip_ports')
            .select('*')
            .eq('device_id', device.id)
            .order('port_number');

          return {
            ...device,
            ports: portsData || []
          };
        })
      );

      setDevices(devicesWithPorts);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Error loading devices",
        description: "Failed to load your devices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your GoIP Devices</CardTitle>
        <CardDescription>Manage your registered devices and ports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {devices.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No devices registered yet.</p>
          </div>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{device.device_name}</h3>
                  <p className="text-sm text-muted-foreground">{device.ip_address}</p>
                </div>
                <AddPortDialog deviceId={device.id} onPortAdded={fetchDevices} />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {device.ports.map((port) => (
                  <div key={port.id} className="border rounded p-2 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span>Port {port.port_number}</span>
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(port.status)}`} />
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {port.sip_username}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
