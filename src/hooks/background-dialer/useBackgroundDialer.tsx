
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
        // Use a more basic query first to check if the campaign exists
        const { data: campaignExists, error: campaignError } = await supabase
          .from('campaigns')
          .select('id')
          .eq('id', campaignId)
          .single();
        
        if (campaignError) {
          console.error("Error fetching campaign:", campaignError);
          toast({
            title: "Error loading campaign",
            description: "Could not find the specified campaign.",
            variant: "destructive"
          });
          setIsLoadingCampaign(false);
          return;
        }
        
        // Check if port_number column exists in campaigns table using the new function
        let portNumberExists = false;
        try {
          const { data, error } = await supabase
            .rpc('column_exists', { 
              table_name: 'campaigns', 
              column_name: 'port_number' 
            });
            
          if (!error && data !== null) {
            portNumberExists = data;
          }
        } catch (err) {
          console.log("Error checking if port_number column exists:", err);
          portNumberExists = false;
        }
        
        // Now fetch the basic campaign data we know exists
        const { data: basicData, error: basicError } = await supabase
          .from('campaigns')
          .select('contact_list_id, transfer_number')
          .eq('id', campaignId)
          .single();
          
        if (basicError) {
          console.error("Error fetching campaign data:", basicError);
          toast({
            title: "Error loading campaign",
            description: "Could not load campaign settings. Please try again.",
            variant: "destructive"
          });
          setIsLoadingCampaign(false);
          return;
        }
        
        // Now safely set the form data
        if (basicData) {
          // Set contact list ID if available
          if (basicData.contact_list_id) {
            handleFormChange("contactListId", basicData.contact_list_id);
          }
          
          // Set transfer number if available
          if (basicData.transfer_number) {
            handleFormChange("transferNumber", basicData.transfer_number);
          }
        }
        
        // Only fetch port_number if the column exists
        let portNumber = 1; // Default to port 1
        if (portNumberExists) {
          try {
            const { data: portData } = await supabase
              .from('campaigns')
              .select('port_number')
              .eq('id', campaignId)
              .single();
              
            if (portData && portData.port_number !== null) {
              portNumber = portData.port_number;
            }
          } catch (portErr) {
            // If there's an error fetching port_number, just use the default (1)
            console.log("Error fetching port number, using default:", portErr);
          }
        } else {
          console.log("Port number column doesn't exist in campaigns table, using default port 1");
        }
        
        // Set the port number we determined
        handleFormChange("portNumber", portNumber);
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
