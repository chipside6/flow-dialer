
import { useState } from "react";
import { DialStatus } from "@/components/background-dialer/types";
import { toast } from "@/components/ui/use-toast";
import { asteriskService } from "@/utils/asteriskService";
import { usePollingInterval } from "@/hooks/usePollingInterval";

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
          toast({
            title: "Dialing Complete",
            description: `Successfully completed dialing campaign with ${status.answeredCalls} answered calls.`,
          });
        } else {
          toast({
            title: "Dialing Failed",
            description: "There was an issue with the dialing operation.",
            variant: "destructive",
          });
        }
      }
    },
    {
      enabled: Boolean(currentJobId && isDialing),
      interval: 3000,
      onError: (error) => {
        console.error("Error polling for status:", error);
        toast({
          title: "Status Update Failed",
          description: "Could not get the latest dialing status.",
          variant: "destructive",
        });
      }
    }
  );
  
  return { dialStatus, setDialStatus };
};
