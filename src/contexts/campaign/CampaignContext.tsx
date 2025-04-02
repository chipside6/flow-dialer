
import React, { createContext, useContext, useState } from 'react';
import { Campaign } from '@/hooks/useCampaigns';
import { useCampaignSimulation } from '@/hooks/useCampaignSimulation';

type CampaignContextType = {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  setSelectedCampaign: (campaign: Campaign) => void;
  startCampaign: (campaignId: string) => void;
  pauseCampaign: (campaignId: string) => void;
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{
  children: React.ReactNode;
  initialCampaigns?: Campaign[];
}> = ({ children, initialCampaigns = [] }) => {
  const campaignSimulation = useCampaignSimulation(initialCampaigns);

  return (
    <CampaignContext.Provider value={campaignSimulation}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaignContext must be used within a CampaignProvider');
  }
  return context;
};
