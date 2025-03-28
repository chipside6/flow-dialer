
import { useDialerForm } from "./useDialerForm";
import { useFetchDialerResources } from "./useFetchDialerResources";
import { useDialerStatus } from "./useDialerStatus";
import { useDialerActions } from "./useDialerActions";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useBackgroundDialer = (campaignId: string) => {
  // Get form data and form handlers
  const { formData, handleFormChange, isLoadingTransferNumbers } = useDialerForm();
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);
  
  // Get resources (SIP Providers and Contact Lists)
  const { 
    sipProviders, 
    contactLists, 
    isLoadingProviders, 
    isLoadingLists 
  } = useFetchDialerResources();
  
  // Get dialer action handlers
  const {
    isDialing,
    currentJobId,
    startDialing,
    stopDialing,
    dialStatus
  } = useDialerActions(formData, campaignId);
  
  // Load campaign data to get the preferred SIP provider
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) return;
      
      setIsLoadingCampaign(true);
      
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('sip_provider_id, contact_list_id, transfer_number')
          .eq('id', campaignId)
          .single();
        
        if (error) {
          console.error("Error fetching campaign data:", error);
          return;
        }
        
        if (data) {
          // If campaign has a SIP provider set, use it
          if (data.sip_provider_id) {
            handleFormChange("sipProviderId", data.sip_provider_id);
          }
          
          // Also set other relevant fields from the campaign
          if (data.contact_list_id) {
            handleFormChange("contactListId", data.contact_list_id);
          }
          
          if (data.transfer_number) {
            handleFormChange("transferNumber", data.transfer_number);
          }
        }
      } catch (err) {
        console.error("Error loading campaign preferences:", err);
      } finally {
        setIsLoadingCampaign(false);
      }
    };
    
    fetchCampaignData();
  }, [campaignId]);
  
  // Start dialing wrapper to include campaign ID
  const handleStartDialing = () => {
    startDialing(campaignId);
  };
  
  return {
    // Resources
    sipProviders,
    contactLists,
    isLoadingProviders,
    isLoadingLists,
    isLoadingCampaign,
    
    // Form
    formData,
    handleFormChange,
    
    // Dialing state
    isDialing,
    currentJobId,
    dialStatus,
    
    // Actions
    startDialing: handleStartDialing,
    stopDialing
  };
};
