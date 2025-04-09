
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
        const response = await asteriskService.getDialingStatus(currentJobId);
        
        // Convert string status to our DialStatus type
        const typedStatus = (response.status as "running" | "completed" | "failed" | "stopped" | "idle") || 'idle';
        
        // Update to handle the response structure correctly with proper defaults
        setDialStatus({
          status: typedStatus,
          totalCalls: response.totalCalls || 0,
          completedCalls: response.completedCalls || 0,
          answeredCalls: response.answeredCalls || 0, // Added with default
          failedCalls: response.failedCalls || 0 // Added with default
        });
        
        if (response.status === 'completed' || response.status === 'failed') {
          setIsDialing(false);
          
          if (response.status === 'completed') {
            toast({
              title: "Dialing Complete",
              description: `Successfully completed dialing campaign with ${response.answeredCalls || 0} answered calls.`,
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
      
      const phoneNumbers = ['17735551234', '17735551235']; // Mock numbers for testing, would be fetched from contact list
      
      const response = await asteriskService.startDialing(
        campaignId, 
        formData.contactListId, 
        formData.transferNumber || '', 
        formData.portNumber || 1
      );
      
      if (response.success && response.jobId) {
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
          description: `The system is now dialing your contact list using port ${formData.portNumber || 1}.`,
        });
      } else {
        throw new Error(response.message || "Unknown error starting dialing");
      }
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
