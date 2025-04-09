
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CampaignCreationWizard } from '@/components/campaign-wizard/CampaignCreationWizard';
import { useCampaigns } from '@/hooks/useCampaigns';
import { PlusCircle, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CampaignDashboard from '@/components/CampaignDashboard';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { CampaignProvider } from '@/contexts/campaign/CampaignContext';
import { Badge } from '@/components/ui/badge';

const Campaign = () => {
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaigns();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Filter campaigns for active, paused, and completed tabs
  const activeFilteredCampaigns = campaigns ? campaigns.filter(c => c.status === 'running') : [];
  const pausedFilteredCampaigns = campaigns ? campaigns.filter(c => c.status === 'paused') : [];
  const completedFilteredCampaigns = campaigns ? campaigns.filter(c => c.status === 'completed') : [];
  
  useEffect(() => {
    // Check if the URL has a state indicating to show the create wizard
    if (location.state && location.state.showCreateWizard) {
      setShowCreateWizard(true);
    }
  }, [location.state]);

  const handleCampaignCreated = (newCampaign: any) => {
    toast({
      title: "Campaign Created",
      description: `${newCampaign.title} has been successfully created.`,
    });
    setShowCreateWizard(false); // Close the wizard
    refreshCampaigns(); // Refresh the campaign list
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCampaigns();
      toast({
        title: "Campaigns Refreshed",
        description: "The campaign list has been updated.",
      });
    } catch (err: any) {
      toast({
        title: "Error Refreshing Campaigns",
        description: err.message || "Failed to refresh campaigns.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">Manage your auto-dialer campaigns</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            <Button 
              onClick={() => setShowCreateWizard(true)}
              size="sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Error and loading states */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || "Failed to load campaigns"}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && !campaigns.length ? (
          <Card>
            <CardContent className="py-10">
              <div className="flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading campaigns...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Campaign tabs */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Campaigns</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="paused">Paused</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {campaigns.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Get started by creating your first campaign.
                      </p>
                      <Button 
                        onClick={() => setShowCreateWizard(true)}
                        className="mx-auto"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Campaign
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <CampaignProvider initialCampaigns={campaigns}>
                    <CampaignTable />
                  </CampaignProvider>
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                {activeFilteredCampaigns.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <h3 className="text-lg font-medium">No active campaigns</h3>
                      <p className="text-muted-foreground">
                        You don't have any running campaigns at the moment.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <CampaignProvider initialCampaigns={activeFilteredCampaigns}>
                    <CampaignTable />
                  </CampaignProvider>
                )}
              </TabsContent>

              <TabsContent value="paused" className="space-y-4">
                {pausedFilteredCampaigns.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <h3 className="text-lg font-medium">No paused campaigns</h3>
                      <p className="text-muted-foreground">
                        You don't have any paused campaigns at the moment.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <CampaignProvider initialCampaigns={pausedFilteredCampaigns}>
                    <CampaignTable />
                  </CampaignProvider>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedFilteredCampaigns.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <h3 className="text-lg font-medium">No completed campaigns</h3>
                      <p className="text-muted-foreground">
                        You don't have any completed campaigns yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <CampaignProvider initialCampaigns={completedFilteredCampaigns}>
                    <CampaignTable />
                  </CampaignProvider>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Create Campaign Wizard Dialog */}
        {showCreateWizard && (
          <CampaignCreationWizard 
            onComplete={handleCampaignCreated}
            onCancel={() => setShowCreateWizard(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Campaign;
