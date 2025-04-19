
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PortStatusBadge } from './PortStatusBadge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const GoipDeviceList = () => {
  const { user } = useAuth();

  const { data: devices, isLoading } = useQuery({
    queryKey: ['goip-devices', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('goip_devices')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!devices?.length) {
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
        <CardTitle>Your Devices</CardTitle>
        <CardDescription>Manage your registered GoIP devices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{device.device_name}</CardTitle>
                  <PortStatusBadge status="idle" />
                </div>
                <CardDescription>{device.ip_address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Ports</Button>
                  <Button variant="outline" size="sm">Test Connection</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
