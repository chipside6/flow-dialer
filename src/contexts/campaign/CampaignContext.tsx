
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campaign } from '@/types/campaign';
import { useCampaignSimulation } from '@/hooks/useCampaignSimulation';

type CampaignContextType = {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  selectedCampaignId: string | null;
  setSelectedCampaign: (campaign: Campaign) => void;
  setSelectedCampaignId: (id: string) => void;
  startCampaign: (campaignId: string) => void;
  pauseCampaign: (campaignId: string) => void;
  deleteCampaign: (campaignId: string) => void;
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{
  children: React.ReactNode;
  initialCampaigns?: Campaign[];
}> = ({ children, initialCampaigns = [] }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const campaignSimulation = useCampaignSimulation(campaigns);
  
  // Update local campaigns state when initialCampaigns changes
  useEffect(() => {
    setCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  return (
    <CampaignContext.Provider value={{
      ...campaignSimulation,
      campaigns: campaigns, // Ensure we use the campaigns from props
    }}>
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
