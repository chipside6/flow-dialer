
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
  
  // Get dialer status hooks (need to declare this first to fix the dependency order)
  const { dialStatus, setDialStatus } = useDialerStatus(null, false);
  
  // Get dialer action handlers (now using the already declared setDialStatus)
  const {
    isDialing,
    currentJobId,
    startDialing,
    stopDialing
  } = useDialerActions(formData, setDialStatus);
  
  // Reattach the status hook with real values
  const statusHook = useDialerStatus(currentJobId, isDialing);
  
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
    dialStatus: statusHook.dialStatus,
    
    // Actions
    startDialing: handleStartDialing,
    stopDialing
  };
};
