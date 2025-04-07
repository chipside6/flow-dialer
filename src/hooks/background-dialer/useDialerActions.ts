
import { useState, useEffect } from "react";
import { DialStatus, DialerFormData } from "@/components/background-dialer/types";
import { asteriskService } from "@/utils/asterisk";
import { toast } from "@/components/ui/use-toast";
import { usePollingInterval } from "@/hooks/usePollingInterval";

export const useDialerActions = (
  formData: DialerFormData,
  campaignId: string
) => {
  const [isDialing, setIsDialing] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
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
          setIsDialing(false);
          
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
      } catch (error) {
        console.error("Error polling for status:", error);
        toast({
          title: "Status Update Failed",
          description: "Could not get the latest dialing status.",
          variant: "destructive",
        });
      }
    },
    {
      enabled: Boolean(currentJobId && isDialing),
      interval: 3000,
    }
  );
  
  const startDialing = async (campaignId: string) => {
    if (!formData.contactListId) {
      toast({
        title: "Incomplete Configuration",
        description: "Please select a contact list before starting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Set max concurrent calls to 3 (enforced)
      const maxConcurrentCalls = 3;
      
      const response = await asteriskService.startDialing({
        contactListId: formData.contactListId,
        campaignId,
        transferNumber: formData.transferNumber,
        // We no longer need sipProviderId as we're using GoIP directly
        greetingFile: formData.greetingFile,
        maxConcurrentCalls // Enforced to 3
      });
      
      setCurrentJobId(response.jobId);
      setIsDialing(true);
      setDialStatus({
        status: 'running',
        totalCalls: 0,
        completedCalls: 0,
        answeredCalls: 0,
        failedCalls: 0
      });
      
      toast({
        title: "Dialing Started",
        description: "The system is now dialing your contact list in the background.",
      });
    } catch (error) {
      console.error("Error starting dialing:", error);
      toast({
        title: "Failed to Start Dialing",
        description: "There was an error starting the dialing process.",
        variant: "destructive",
      });
    }
  };
  
  const stopDialing = async () => {
    if (!currentJobId) return;
    
    try {
      await asteriskService.stopDialing(currentJobId);
      setIsDialing(false);
      setDialStatus({
        ...dialStatus,
        status: 'stopped'
      });
      
      toast({
        title: "Dialing Stopped",
        description: "The dialing operation has been stopped.",
      });
    } catch (error) {
      console.error("Error stopping dialing:", error);
      toast({
        title: "Failed to Stop Dialing",
        description: "There was an error stopping the dialing process.",
        variant: "destructive",
      });
    }
  };
  
  return {
    isDialing,
    currentJobId,
    dialStatus,
    startDialing,
    stopDialing
  };
};
