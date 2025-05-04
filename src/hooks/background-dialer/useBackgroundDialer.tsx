
import { useDialerForm } from "./useDialerForm";
import { useFetchDialerResources } from "./useFetchDialerResources";
import { useDialerActions } from "./useDialerActions";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Helper function to check if a column exists in the campaigns table
const checkColumnExists = async (accessToken: string) => {
  try {
    const response = await fetch(
      'https://grhvoclalziyjbjlhpml.supabase.co/functions/v1/check-column-exists',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          table_name: 'campaigns',
          column_name: 'port_number'
        })
      }
    );
    if (response.ok) {
      const result = await response.json();
      return result.exists;
    } else {
      throw new Error("Failed to check column existence.");
    }
  } catch (err) {
    console.error("Error checking column existence:", err);
    return false;
  }
};

export const useBackgroundDialer = (campaignId: string) => {
  const { formData, handleFormChange, isLoadingTransferNumbers } = useDialerForm();
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);
  
  // Get resources (Contact Lists)
  const { 
    contactLists, 
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
  
  // Load campaign data to get the campaign preferences
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) return;

      setIsLoadingCampaign(true);

      try {
        // Check if the campaign exists
        const { data: campaignExists, error: campaignError } = await supabase
          .from('campaigns')
          .select('id')
          .eq('id', campaignId)
          .single();

        if (campaignError || !campaignExists) {
          console.error("Error fetching campaign:", campaignError);
          toast({
            title: "Error loading campaign",
            description: "Could not find the specified campaign.",
            variant: "destructive"
          });
          setIsLoadingCampaign(false);
          return;
        }

        // Fetch the basic campaign data
        const { data: basicData, error: basicError } = await supabase
          .from('campaigns')
          .select('contact_list_id, transfer_number')
          .eq('id', campaignId)
          .single();

        if (basicError || !basicData) {
          console.error("Error fetching campaign data:", basicError);
          toast({
            title: "Error loading campaign",
            description: "Could not load campaign settings. Please try again.",
            variant: "destructive"
          });
          setIsLoadingCampaign(false);
          return;
        }

        // Set the contact list ID and transfer number
        if (basicData.contact_list_id) handleFormChange("contactListId", basicData.contact_list_id);
        if (basicData.transfer_number) handleFormChange("transferNumber", basicData.transfer_number);

        // Fetch port number if column exists
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          const portNumberExists = await checkColumnExists(sessionData.session.access_token);
          let portNumber = 1; // Default to port 1
          
          if (portNumberExists) {
            const { data: portData } = await supabase
              .from('campaigns')
              .select('port_number')
              .eq('id', campaignId)
              .single();
            
            if (portData?.port_number !== null) {
              portNumber = portData.port_number;
            }
          }

          handleFormChange("portNumber", portNumber);
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
  const handleStartDialing = useCallback(() => {
    if (!campaignId) {
      toast({
        title: "Error",
        description: "Campaign ID is missing. Please select a valid campaign.",
        variant: "destructive"
      });
      return;
    }
    startDialing();
  }, [startDialing, campaignId]);

  return {
    // Resources
    contactLists,
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
