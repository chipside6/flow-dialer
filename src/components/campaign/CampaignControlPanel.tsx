import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import CampaignDialer from '@/components/dialer/CampaignDialer';

interface CampaignControlPanelProps {
  campaignId: string;
}

// Updated port interface to match what the DB function returns
interface Port {
  id: string;
  device_name: string;
  port_number: number;
  status: string;
  campaign_name?: string;
}

export const CampaignControlPanel: React.FC<CampaignControlPanelProps> = ({ campaignId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<any | null>(null);
  const [selectedPorts, setSelectedPorts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [availablePorts, setAvailablePorts] = useState<Port[]>([]);
  
  // Load campaign data
  useEffect(() => {
    if (user?.id && campaignId) {
      fetchCampaignData();
      fetchAvailablePorts();
    }
  }, [campaignId, user?.id]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          contact_list_id,
          contact_lists(name, id),
          greeting_file_url,
          transfer_number
        `)
        .eq('id', campaignId)
        .single();

      if (error) {
        throw error;
      }

      setCampaign(data);
      
      // If campaign has ports configured, select them
      if (data) {
        const { data: campaignPorts } = await supabase
          .from('campaign_ports')
          .select('port_id, goip_ports(port_number)')
          .eq('campaign_id', campaignId);
          
        if (campaignPorts?.length) {
          const portNumbers = campaignPorts.map(p => p.goip_ports?.port_number).filter(Boolean);
          setSelectedPorts(portNumbers as number[]);
        }
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast({
        title: 'Error',
        description: 'Could not load campaign data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailablePorts = async () => {
    try {
      // Get available trunks instead of ports
      const { data, error } = await supabase
        .rpc('get_port_status', { user_id_param: user?.id });

      if (error) {
        throw error;
      }

      // Types now match correctly
      setAvailablePorts(data || []);
    } catch (error) {
      console.error('Error fetching ports:', error);
    }
  };

  const handlePortSelect = (portNumber: number) => {
    setSelectedPorts(prev => {
      if (prev.includes(portNumber)) {
        return prev.filter(p => p !== portNumber);
      } else {
        return [...prev, portNumber];
      }
    });
  };

  if (loading || !campaign) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading campaign data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dialer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dialer">Dialer Control</TabsTrigger>
          <TabsTrigger value="ports">Port Selection ({selectedPorts.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dialer" className="mt-4">
          <CampaignDialer
            campaignId={campaignId}
            selectedPorts={selectedPorts}
            transferNumber={campaign.transfer_number}
            greetingFileUrl={campaign.greeting_file_url}
          />
        </TabsContent>
        
        <TabsContent value="ports" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Select GoIP Ports</CardTitle>
            </CardHeader>
            <CardContent>
              {availablePorts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No GoIP ports found. Please configure your GoIP devices first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availablePorts.map((port) => (
                    <div 
                      key={port.id}
                      className={`
                        border p-3 rounded-md cursor-pointer
                        ${selectedPorts.includes(port.port_number) ? 'bg-primary/10 border-primary' : 'bg-card'}
                        ${port.status !== 'available' ? 'opacity-50' : ''}
                      `}
                      onClick={() => port.status === 'available' && handlePortSelect(port.port_number)}
                    >
                      <div className="font-medium">Port {port.port_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {port.device_name || 'Unknown device'}
                      </div>
                      <div className={`text-xs mt-1 ${port.status === 'available' ? 'text-green-600' : 'text-amber-600'}`}>
                        {port.status === 'available' ? 'Available' : 'In use'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {availablePorts.length > 0 && selectedPorts.length === 0 && (
                <div className="mt-4 text-center text-amber-600 text-sm">
                  Please select at least one port to start dialing.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignControlPanel;
