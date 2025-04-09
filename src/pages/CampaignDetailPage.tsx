
import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CampaignDetails } from '@/components/campaigns/CampaignDetails';

const CampaignDetailPage = () => {
  const { campaignId } = useParams();
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <CampaignDetails campaignId={campaignId} />
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetailPage;
