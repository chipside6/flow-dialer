
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Play, Phone, FileText, Server, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { DialerJobControl } from '@/components/dialer/DialerJobControl';
import { CallLogsTable } from '@/components/dialer/CallLogsTable';
import { AsteriskConfigDisplay } from '@/components/dialer/AsteriskConfigDisplay';
import { TransferNumberSelector } from '@/components/dialer/TransferNumberSelector';
import { CallerIdSelector } from '@/components/dialer/CallerIdSelector';
import { useCallLogs } from '@/hooks/useCallLogs';
import { TestCampaignButton } from '@/components/dialer/TestCampaignButton';
import { GoipStatusBadge } from '@/components/goip/GoipStatusBadge';

const CampaignDialer = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const { logs, refresh: refreshLogs } = useCallLogs({ 
    campaignId,
    refreshInterval: null
  });
  
  // Load campaign data
  useEffect(() => {
    if (campaignId && user?.id) {
      loadCampaign();
    }
  }, [campaignId, user?.id]);
  
  // Load campaign data
  const loadCampaign = async () => {
    if (!campaignId || !user?.id) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          contact_lists!inner(
            id,
            name
          )
        `)
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setCampaign(data);
      } else {
        toast({
          title: 'Campaign not found',
          description: 'The campaign could not be found or you do not have access to it',
          variant: 'destructive'
        });
        navigate('/campaigns');
      }
    } catch (err) {
      console.error('Error loading campaign:', err);
      toast({
        title: 'Error loading campaign',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      navigate('/campaigns');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle transfer number selection
  const handleTransferNumberSelect = (transferNumber: string) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        transfer_number: transferNumber
      });
    }
  };
  
  // Handle caller ID change
  const handleCallerIdChange = (callerId: string) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        caller_id: callerId
      });
    }
  };
  
  // Get status badge color based on campaign status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'default';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'cancelled':
      case 'paused':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/campaigns')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
          
          {isLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <p>Loading campaign details...</p>
            </div>
          ) : campaign ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{campaign.title}</h1>
                  {user?.id && (
                    <GoipStatusBadge 
                      userId={user.id}
                      portNumber={campaign.port_number || 1}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusBadgeVariant(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {campaign.contact_lists?.name}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <TestCampaignButton 
                  campaignId={campaignId || ''}
                  disabled={!campaign.greeting_file_url || !campaign.transfer_number}
                />
                
                <Button onClick={() => window.open(campaign.greeting_file_url, '_blank')}>
                  <Play className="h-4 w-4 mr-2" />
                  Preview Audio
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        
        {!isLoading && campaign && (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">
                <Phone className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="logs">
                <FileText className="h-4 w-4 mr-2" />
                Call Logs
              </TabsTrigger>
              <TabsTrigger value="config">
                <Server className="h-4 w-4 mr-2" />
                Asterisk Config
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <DialerJobControl 
                    campaignId={campaignId || ''}
                    campaignStatus={campaign.status}
                    refetchCampaign={loadCampaign}
                  />
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuration</CardTitle>
                      <CardDescription>
                        Setup required for dialing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <TransferNumberSelector
                        campaignId={campaignId || ''}
                        onTransferNumberSelect={handleTransferNumberSelect}
                      />
                      
                      <CallerIdSelector
                        campaignId={campaignId || ''}
                        onCallerIdChange={handleCallerIdChange}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="logs">
              <CallLogsTable 
                logs={logs} 
                onRefresh={refreshLogs}
              />
            </TabsContent>
            
            <TabsContent value="config">
              <AsteriskConfigDisplay
                username={user?.id ? `goip_${user.id}_port${campaign.port_number || 1}` : ''}
                password="********" // Masked for security
                host="dynamic"
                port={5060}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CampaignDialer;
