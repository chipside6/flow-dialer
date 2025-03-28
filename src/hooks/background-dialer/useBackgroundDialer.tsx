
import { useDialerForm } from "./useDialerForm";
import { useFetchDialerResources } from "./useFetchDialerResources";
import { useDialerStatus } from "./useDialerStatus";
import { useDialerActions } from "./useDialerActions";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
        // Query only the columns that actually exist in the database
        const { data, error } = await supabase
          .from('campaigns')
          .select('contact_list_id, transfer_number, sip_provider_id')
          .eq('id', campaignId)
          .single();
        
        if (error) {
          console.error("Error fetching campaign data:", error);
          toast({
            title: "Error loading campaign",
            description: "Could not load campaign settings. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        if (data) {
          // If campaign has a SIP provider set, use it
          if (data.sip_provider_id) {
            handleFormChange("sipProviderId", data.sip_provider_id);
          }
          
          // Set contact list ID if available
          if (data.contact_list_id) {
            handleFormChange("contactListId", data.contact_list_id);
          }
          
          // Set transfer number if available
          if (data.transfer_number) {
            handleFormChange("transferNumber", data.transfer_number);
          }
        }
      } catch (err) {
        console.error("Error loading campaign preferences:", err);
        toast({
          title: "Error",
          description: "Failed to load campaign settings",
          variant: "destructive"
        });
      } finally {
        setIsLoadingCampaign(false);
      }
    };
    
    fetchCampaignData();
  }, [campaignId, handleFormChange]);
  
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
