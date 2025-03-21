
import { useState } from "react";
import { DialStatus, DialerFormData } from "@/components/background-dialer/types";
import { toast } from "@/components/ui/use-toast";
import { asteriskService } from "@/utils/asteriskService";

export const useDialerActions = (
  formData: DialerFormData,
  setDialStatus: React.Dispatch<React.SetStateAction<DialStatus>>
) => {
  const [isDialing, setIsDialing] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  
  const startDialing = async (campaignId: string) => {
    if (!formData.sipProviderId || !formData.contactListId) {
      toast({
        title: "Incomplete Configuration",
        description: "Please select a SIP provider and contact list before starting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await asteriskService.startDialing({
        contactListId: formData.contactListId,
        campaignId,
        transferNumber: formData.transferNumber,
        sipProviderId: formData.sipProviderId,
        greetingFile: formData.greetingFile,
        maxConcurrentCalls: formData.maxConcurrentCalls ? parseInt(formData.maxConcurrentCalls) : undefined
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
      setDialStatus(prev => ({
        ...prev,
        status: 'stopped'
      }));
      
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
    startDialing,
    stopDialing
  };
};
