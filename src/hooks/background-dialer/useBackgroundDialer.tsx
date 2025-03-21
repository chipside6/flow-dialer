
import { useDialerForm } from "./useDialerForm";
import { useFetchDialerResources } from "./useFetchDialerResources";
import { useDialerStatus } from "./useDialerStatus";
import { useDialerActions } from "./useDialerActions";
import { DialerFormData } from "@/components/background-dialer/types";

export const useBackgroundDialer = (campaignId: string) => {
  // Get form data and form handlers
  const { formData, handleFormChange } = useDialerForm();
  
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
    stopDialing
  } = useDialerActions(formData, setDialStatus);
  
  // Get dialer status
  const { dialStatus, setDialStatus } = useDialerStatus(currentJobId, isDialing);
  
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
