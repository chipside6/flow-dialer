
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CampaignDetails } from '@/components/campaigns/CampaignDetails';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Campaign } from '@/types/campaign';
import { useCampaigns } from '@/hooks/useCampaigns';

export const CampaignDashboard = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const { getCampaign, isLoading, error } = useCampaigns();

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (campaignId) {
        try {
          const campaignData = await getCampaign(campaignId);
          setCampaign(campaignData);
        } catch (err) {
          console.error("Error fetching campaign details:", err);
        }
      }
    };

    fetchCampaignDetails();
  }, [campaignId, getCampaign]);

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
