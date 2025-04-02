
import React, { createContext, useContext, useState } from 'react';
import { Campaign } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { asteriskService } from '@/utils/asterisk';

interface CampaignContextProps {
  selectedCampaign: Campaign | null;
  setSelectedCampaign: (campaign: Campaign | null) => void;
  startCampaign: (campaignId: string) => Promise<void>;
  pauseCampaign: (campaignId: string) => Promise<void>;
}

const CampaignContext = createContext<CampaignContextProps>({
  selectedCampaign: null,
  setSelectedCampaign: () => {},
  startCampaign: async () => {},
  pauseCampaign: async () => {},
});

export const useCampaignContext = () => useContext(CampaignContext);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const { toast } = useToast();

  const startCampaign = async (campaignId: string) => {
    try {
      // First, update the campaign status in the database
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'running' })
        .eq('id', campaignId);

      if (error) throw error;

      // Get the campaign details to send to the dialer
      const { data: campaignData, error: fetchError } = await supabase
        .from('campaigns')
        .select(`
          *,
          contact_lists(id, name)
        `)
        .eq('id', campaignId)
        .single();

      if (fetchError) throw fetchError;

      // Start the actual dialing process through Asterisk service
      await asteriskService.startDialing({
        campaignId,
        contactListId: campaignData.contact_list_id,
        sipProviderId: campaignData.sip_provider_id,
        transferNumber: campaignData.transfer_number,
        greetingFile: campaignData.greeting_file_url,
        maxConcurrentCalls: 1 // Default to 1 concurrent call
      });

      // Show success message
      toast({
        title: "Campaign Started",
        description: "Your campaign is now running and will begin dialing contacts.",
      });

      // If the selected campaign is the one being started, update its state
      if (selectedCampaign && selectedCampaign.id === campaignId) {
        setSelectedCampaign({
          ...selectedCampaign,
          status: 'running'
        });
      }
    } catch (err: any) {
      console.error("Error starting campaign:", err);
      toast({
        title: "Error Starting Campaign",
        description: err.message || "An error occurred while starting the campaign.",
        variant: "destructive",
      });
    }
  };

  const pauseCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'paused' })
        .eq('id', campaignId);

      if (error) throw error;

      // Stop the dialing process
      await asteriskService.stopDialingCampaign(campaignId);

      toast({
        title: "Campaign Paused",
        description: "Your campaign has been paused and is no longer dialing.",
      });

      // Update selected campaign if it's the one being paused
      if (selectedCampaign && selectedCampaign.id === campaignId) {
        setSelectedCampaign({
          ...selectedCampaign,
          status: 'paused'
        });
      }
    } catch (err: any) {
      console.error("Error pausing campaign:", err);
      toast({
        title: "Error Pausing Campaign",
        description: err.message || "An error occurred while pausing the campaign.",
        variant: "destructive",
      });
    }
  };

  return (
    <CampaignContext.Provider value={{
      selectedCampaign,
      setSelectedCampaign,
      startCampaign,
      pauseCampaign
    }}>
      {children}
    </CampaignContext.Provider>
  );
};
