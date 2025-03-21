
import { useState } from "react";
import { DialStatus } from "@/components/background-dialer/types";
import { asteriskService } from "@/utils/asteriskService";
import { usePollingInterval } from "@/hooks/usePollingInterval";
import { 
  createDialerError, 
  DialerErrorType, 
  handleDialerError 
} from "@/utils/errorHandlingUtils";

export const useDialerStatus = (currentJobId: string | null, isDialing: boolean) => {
  const [dialStatus, setDialStatus] = useState<DialStatus>({
    status: 'idle',
    totalCalls: 0,
    completedCalls: 0,
    answeredCalls: 0,
    failedCalls: 0
  });
  
  // Poll for status updates when a job is running
  usePollingInterval(
    async () => {
      if (!currentJobId) return;
      
      try {
        const status = await asteriskService.getDialingStatus(currentJobId);
        
        setDialStatus({
          ...status,
          status: status.status === 'running' ? 'running' : 
                  status.status === 'completed' ? 'completed' : 
                  status.status === 'failed' ? 'failed' : 'stopped'
        });
        
        if (status.status === 'completed' || status.status === 'failed') {
          // Let the parent hook know to stop dialing if needed
          if (status.status === 'completed') {
            handleDialerError(createDialerError(
              DialerErrorType.UNKNOWN,
              `Successfully completed dialing campaign with ${status.answeredCalls} answered calls.`,
              null
            ));
          } else {
            handleDialerError(createDialerError(
              DialerErrorType.SERVER,
              "There was an issue with the dialing operation.",
              null
            ));
          }
        }
      } catch (error) {
        console.error("Error polling for status:", error);
        handleDialerError(createDialerError(
          DialerErrorType.CONNECTION,
          "Could not get the latest dialing status.",
          error
        ));
      }
    },
    {
      enabled: Boolean(currentJobId && isDialing),
      interval: 3000,
      onError: (error) => {
        handleDialerError(createDialerError(
          DialerErrorType.CONNECTION,
          "Could not get the latest dialing status.",
          error
        ));
      }
    }
  );
  
  return { dialStatus, setDialStatus };
};
