
import { useState } from "react";
import { DialStatus, DialerFormData } from "@/components/background-dialer/types";
import { asteriskService } from "@/utils/asteriskService";
import { 
  createDialerError, 
  DialerErrorType, 
  handleDialerError, 
  tryCatchWithErrorHandling 
} from "@/utils/errorHandlingUtils";

export const useDialerActions = (
  formData: DialerFormData,
  setDialStatus: React.Dispatch<React.SetStateAction<DialStatus>>
) => {
  const [isDialing, setIsDialing] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  
  const startDialing = async (campaignId: string) => {
    if (!formData.sipProviderId || !formData.contactListId) {
      handleDialerError(createDialerError(
        DialerErrorType.CONFIGURATION,
        "Please select a SIP provider and contact list before starting.",
        null
      ));
      return;
    }
    
    const response = await tryCatchWithErrorHandling(
      async () => {
        const result = await asteriskService.startDialing({
          contactListId: formData.contactListId,
          campaignId,
          transferNumber: formData.transferNumber,
          sipProviderId: formData.sipProviderId,
          greetingFile: formData.greetingFile,
          maxConcurrentCalls: formData.maxConcurrentCalls ? parseInt(formData.maxConcurrentCalls) : undefined
        });
        
        return result;
      },
      "There was an error starting the dialing process.",
      DialerErrorType.SERVER
    );
      
    if (response) {
      setCurrentJobId(response.jobId);
      setIsDialing(true);
      setDialStatus({
        status: 'running',
        totalCalls: 0,
        completedCalls: 0,
        answeredCalls: 0,
        failedCalls: 0
      });
      
      handleDialerError(createDialerError(
        DialerErrorType.UNKNOWN,
        "The system is now dialing your contact list in the background.",
        null
      ));
    }
  };
  
  const stopDialing = async () => {
    if (!currentJobId) return;
    
    const success = await tryCatchWithErrorHandling(
      async () => {
        await asteriskService.stopDialing(currentJobId);
        return true;
      },
      "There was an error stopping the dialing process.",
      DialerErrorType.SERVER
    );
    
    if (success) {
      setIsDialing(false);
      setDialStatus(prev => ({
        ...prev,
        status: 'stopped'
      }));
      
      handleDialerError(createDialerError(
        DialerErrorType.UNKNOWN,
        "The dialing operation has been stopped.",
        null
      ));
    }
  };
  
  return {
    isDialing,
    currentJobId,
    startDialing,
    stopDialing
  };
};
