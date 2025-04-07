
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
        // First check if port_number column exists by examining the table structure
        const { error: structureError } = await supabase
          .from('campaigns')
          .select('port_number')
          .limit(1);
        
        // If port_number doesn't exist, we need to handle this case
        const includePortNumber = !structureError;
        
        // Select necessary fields - dynamically adjust the query based on column existence
        const selectFields = includePortNumber 
          ? 'contact_list_id, transfer_number, port_number' 
          : 'contact_list_id, transfer_number';
          
        const { data, error } = await supabase
          .from('campaigns')
          .select(selectFields)
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
          // Set contact list ID if available - using safe access
          if (data.contact_list_id) {
            handleFormChange("contactListId", data.contact_list_id);
          }
          
          // Set transfer number if available - using safe access
          if (data.transfer_number) {
            handleFormChange("transferNumber", data.transfer_number);
          }
          
          // Set port number from campaign or default to 1
          // Safe access with nullish coalescing to handle undefined or non-existent column
          const portNumber = (data as any).port_number ?? 1;
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
