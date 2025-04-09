
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CampaignDetails } from '@/components/campaigns/CampaignDetails';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge'; // Add missing import
import { Campaign } from '@/types/campaign';
import { useCampaigns } from '@/hooks/useCampaigns';

interface CampaignDashboardProps {
  campaignId?: string;
  initialCampaigns?: Campaign[];
  onRefresh?: () => void;
}

export const CampaignDashboard: React.FC<CampaignDashboardProps> = ({ 
  campaignId: propCampaignId,
  initialCampaigns,
  onRefresh
}) => {
  const { campaignId: paramCampaignId } = useParams<{ campaignId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaigns();

  // Use either the prop campaignId or the URL param
  const campaignId = propCampaignId || paramCampaignId;

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (campaignId && campaigns) {
        // Find the campaign in the list of campaigns
        const foundCampaign = campaigns.find(c => c.id === campaignId);
        if (foundCampaign) {
          setCampaign(foundCampaign);
        }
      } else if (initialCampaigns && initialCampaigns.length > 0) {
        // If initialCampaigns is provided, use the first one
        setCampaign(initialCampaigns[0]);
      }
    };

    fetchCampaignDetails();
  }, [campaignId, campaigns, initialCampaigns]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      refreshCampaigns();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <h2 className="text-lg font-semibold text-red-700">Error</h2>
        <p className="text-red-600">Failed to load campaign details. Please try again later.</p>
      </Card>
    );
  }

  // If we have initialCampaigns but no campaign is selected, show a list of campaigns
  if (initialCampaigns && initialCampaigns.length > 0 && !campaign) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Campaigns</h2>
        {initialCampaigns.map((campaign) => (
          <Card key={campaign.id} className="p-4">
            <h3 className="font-medium">{campaign.title}</h3>
            <p className="text-sm text-gray-500">{campaign.description}</p>
            <div className="mt-2">
              <Badge variant="outline">{campaign.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
          <TabsTrigger value="calls">Call Records</TabsTrigger>
          <TabsTrigger value="settings">Campaign Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="py-4">
          <CampaignDetails campaignId={campaignId} />
        </TabsContent>
        
        <TabsContent value="calls" className="py-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Call Records</h2>
            <p className="text-gray-500">No call records available for this campaign yet.</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="py-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Settings</h2>
            <p className="text-gray-500">Settings functionality coming soon.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDashboard;
