
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PortMonitorProps {
  userId?: string;
}

interface Port {
  id: string;
  device_name: string;
  port_number: number;
  status: string;
  campaign_name?: string;
}

export const PortMonitor = ({ userId }: PortMonitorProps) => {
  const { toast } = useToast();
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPorts = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_port_status', { user_id_param: userId });

      if (error) throw error;

      // Ensure data is an array of Port objects
      const portData = data ? data as Port[] : [];
      setPorts(portData);
    } catch (error) {
      console.error('Error fetching port status:', error);
      toast({
        title: "Error loading ports",
        description: "Failed to load port status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('port-status-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'goip_ports' },
        () => {
          fetchPorts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">Available</Badge>;
      case 'busy':
        return <Badge variant="destructive">In Use</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
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
        <CardTitle>Port Status Monitor</CardTitle>
        <CardDescription>Real-time status of all your GoIP ports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ports.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No ports configured yet.</p>
            </div>
          ) : (
            ports.map((port) => (
              <div key={port.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{port.device_name} - Port {port.port_number}</div>
                  {port.campaign_name && (
                    <div className="text-sm text-muted-foreground">
                      Campaign: {port.campaign_name}
                    </div>
                  )}
                </div>
                {getStatusBadge(port.status)}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
