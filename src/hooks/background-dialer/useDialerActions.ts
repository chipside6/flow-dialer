
import { useState, useEffect, useCallback } from "react";
import { DialStatus, DialerFormData } from "@/components/background-dialer/types";
import { autoDialerService } from "@/services/autodialer/autoDialerService";
import { toast } from "@/components/ui/use-toast";
import { usePollingInterval } from "@/hooks/usePollingInterval";
import { goipPortManager } from "@/utils/asterisk/services/goipPortManager";
import { useAuth } from "@/contexts/auth";

export const useDialerActions = (
  formData: DialerFormData,
  campaignId: string
) => {
  const { user } = useAuth();
  const [isDialing, setIsDialing] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [availablePorts, setAvailablePorts] = useState<number>(0);
  const [dialStatus, setDialStatus] = useState<DialStatus>({
    status: 'idle',
    totalCalls: 0,
    completedCalls: 0,
    answeredCalls: 0,
    failedCalls: 0
  });
  
  // Get available ports count
  const getAvailablePorts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const ports = await goipPortManager.getUserPorts(user.id);
      const availableCount = ports.filter(p => p.status === 'available').length;
      setAvailablePorts(availableCount);
      return availableCount;
    } catch (error) {
      console.error("Error getting available ports:", error);
      return 1; // Default to 1 if error
    }
  }, [user?.id]);
  
  // Load ports on initial render
  useEffect(() => {
    getAvailablePorts();
  }, [getAvailablePorts]);
  
  // Poll for status updates when a job is running
  usePollingInterval(
    async () => {
      if (!currentJobId || !user?.id) return;
      
      try {
        const { success, job } = await autoDialerService.getJobStatus(currentJobId, user.id);
        
        if (success && job) {
          // Convert string status to our DialStatus type
          const typedStatus = (job.status as "running" | "completed" | "failed" | "stopped" | "idle") || 'idle';
          
          // Update to handle the response structure correctly
          setDialStatus({
            status: typedStatus,
            totalCalls: job.total_calls || 0,
            completedCalls: job.completed_calls || 0,
            answeredCalls: job.successful_calls || 0,
            failedCalls: job.failed_calls || 0
          });
          
          if (job.status === 'completed' || job.status === 'failed') {
            setIsDialing(false);
            
            if (job.status === 'completed') {
              toast({
                title: "Dialing Complete",
                description: `Successfully completed dialing campaign with ${job.successful_calls || 0} answered calls.`,
              });
            } else {
              toast({
                title: "Dialing Failed",
                description: "There was an issue with the dialing operation.",
                variant: "destructive",
              });
            }
            
            // Update ports count after job completes
            getAvailablePorts();
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
      enabled: Boolean(currentJobId && isDialing && user?.id),
      interval: 3000,
    }
  );
  
  const startDialing = useCallback(async () => {
    if (!formData.contactListId || !user?.id) {
      toast({
        title: "Incomplete Configuration",
        description: "Please select a contact list before starting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get available ports count
      const portsCount = await getAvailablePorts();
      
      if (portsCount === 0) {
        toast({
          title: "No Available Ports",
          description: "All GoIP ports are currently in use. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      // Start dialer job with automatic port assignment
      const response = await autoDialerService.startDialerJob({
        campaignId, 
        userId: user.id,
        maxConcurrentCalls: portsCount // Use all available ports
      });
      
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
          description: `The system is now dialing your contact list using ${portsCount} available ports.`,
        });
      } else {
        throw new Error(response.error || "Unknown error starting dialing");
      }
    } catch (error) {
      console.error("Error starting dialing:", error);
      toast({
        title: "Failed to Start Dialing",
        description: "There was an error starting the dialing process.",
        variant: "destructive",
      });
    }
  }, [campaignId, formData.contactListId, user?.id, getAvailablePorts]);
  
  const stopDialing = useCallback(async () => {
    if (!currentJobId || !user?.id) return;
    
    try {
      await autoDialerService.cancelDialerJob(currentJobId, user.id);
      setIsDialing(false);
      setDialStatus({
        ...dialStatus,
        status: 'stopped'
      });
      
      toast({
        title: "Dialing Stopped",
        description: "The dialing operation has been stopped and all ports have been released.",
      });
      
      // Update available ports
      getAvailablePorts();
    } catch (error) {
      console.error("Error stopping dialing:", error);
      toast({
        title: "Failed to Stop Dialing",
        description: "There was an error stopping the dialing process.",
        variant: "destructive",
      });
    }
  }, [currentJobId, dialStatus, user?.id, getAvailablePorts]);
  
  // Make a test call using a single available port
  const makeTestCall = useCallback(async (phoneNumber: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to make test calls.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await autoDialerService.makeTestCall(phoneNumber, campaignId, user.id);
      
      if (result.success) {
        toast({
          title: "Test Call Initiated",
          description: result.message,
        });
      } else {
        toast({
          title: "Test Call Failed",
          description: result.message,
          variant: "destructive",
        });
      }
      
      // Update available ports
      setTimeout(() => {
        getAvailablePorts();
      }, 1000);
    } catch (error) {
      console.error("Error making test call:", error);
      toast({
        title: "Test Call Failed",
        description: "Could not initiate test call.",
        variant: "destructive",
      });
    }
  }, [campaignId, user?.id, getAvailablePorts]);
  
  return {
    isDialing,
    currentJobId,
    dialStatus,
    availablePorts,
    startDialing,
    stopDialing,
    makeTestCall,
    refreshPortsStatus: getAvailablePorts
  };
};
