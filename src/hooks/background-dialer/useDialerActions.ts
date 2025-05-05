
import { useState, useEffect, useCallback } from "react";
import { DialStatus, DialerFormData } from "@/components/background-dialer/types";
import { autoDialerService } from "@/services/autodialer/autoDialerService";
import { toast } from "@/components/ui/use-toast";
import { usePollingInterval } from "@/hooks/usePollingInterval";
import { goipPortManager } from "@/utils/asterisk/services/goipPortManager";
import { useAuth } from "@/contexts/auth";

const RETRY_DELAY = 3000; // Retry delay for error handling (3 seconds)

export const useDialerActions = (formData: DialerFormData, campaignId: string) => {
  const { user } = useAuth();
  const [isDialing, setIsDialing] = useState<boolean>(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [availablePorts, setAvailablePorts] = useState<number>(0);
  const [dialStatus, setDialStatus] = useState<DialStatus>({
    status: 'idle',
    totalCalls: 0,
    completedCalls: 0,
    answeredCalls: 0,
    failedCalls: 0,
  });

  const handleToast = useCallback((message: { title: string, description: string }, variant: "default" | "destructive" | "warning" = "default") => {
    toast({
      title: message.title,
      description: message.description,
      variant,
    });
  }, []);

  // Fetch available ports count
  const getAvailablePorts = useCallback(async (retry = true) => {
    if (!user?.id) return 0;
    
    try {
      const ports = await goipPortManager.getUserPorts(user.id);
      const availableCount = ports.filter((p) => p.status === 'available').length;
      setAvailablePorts(availableCount);
      return availableCount;
    } catch (error) {
      console.error("Error getting available ports:", error);
      if (retry) {
        setTimeout(() => getAvailablePorts(false), RETRY_DELAY); // Retry after 3 seconds
      }
      return 0; // Return 0 if error persists
    }
  }, [user?.id]);

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
          const typedStatus = (job.status as "running" | "completed" | "failed" | "stopped" | "idle") || 'idle';
          setDialStatus({
            status: typedStatus,
            totalCalls: job.total_calls || 0,
            completedCalls: job.completed_calls || 0,
            answeredCalls: job.successful_calls || 0,
            failedCalls: job.failed_calls || 0,
          });

          if (job.status === 'completed' || job.status === 'failed') {
            setIsDialing(false);
            const message = job.status === 'completed' 
              ? `Successfully completed dialing campaign with ${job.successful_calls || 0} answered calls.`
              : "There was an issue with the dialing operation.";
            const variant = job.status === 'completed' ? "default" : "destructive";
            handleToast({ 
              title: "Dialing Complete", 
              description: message
            }, variant);
            getAvailablePorts();
          }
        }
      } catch (error) {
        console.error("Error polling for status:", error);
        handleToast({
          title: "Status Update Failed",
          description: "Could not get the latest dialing status."
        }, "destructive");
      }
    },
    {
      enabled: Boolean(currentJobId && isDialing && user?.id),
      interval: 3000,
    }
  );

  const startDialing = useCallback(async () => {
    if (!formData.contactListId || !user?.id) {
      handleToast({ 
        title: "Incomplete Configuration", 
        description: "Please select a contact list before starting." 
      }, "destructive");
      return;
    }

    try {
      const portsCount = await getAvailablePorts();
      if (portsCount === 0) {
        handleToast({ 
          title: "No Available Ports", 
          description: "All GoIP ports are currently in use. Please try again later." 
        }, "destructive");
        return;
      }

      const response = await autoDialerService.startDialerJob({
        campaignId,
        userId: user.id,
        maxConcurrentCalls: portsCount,
      });

      if (response.success && response.jobId) {
        setCurrentJobId(response.jobId);
        setIsDialing(true);
        setDialStatus({
          status: 'running',
          totalCalls: 0,
          completedCalls: 0,
          answeredCalls: 0,
          failedCalls: 0,
        });

        handleToast({ 
          title: "Dialing Started", 
          description: `Dialing using ${portsCount} available ports.` 
        });
      } else {
        throw new Error(response.error || "Unknown error starting dialing");
      }
    } catch (error) {
      console.error("Error starting dialing:", error);
      handleToast({ 
        title: "Failed to Start Dialing", 
        description: "There was an error starting the dialing process." 
      }, "destructive");
    }
  }, [campaignId, formData.contactListId, user?.id, getAvailablePorts, handleToast]);

  const stopDialing = useCallback(async () => {
    if (!currentJobId || !user?.id) return;

    try {
      await autoDialerService.cancelDialerJob(currentJobId, user.id);
      setIsDialing(false);
      setDialStatus({ ...dialStatus, status: 'stopped' });

      handleToast({ 
        title: "Dialing Stopped", 
        description: "The dialing operation has been stopped and all ports have been released." 
      });
      getAvailablePorts();
    } catch (error) {
      console.error("Error stopping dialing:", error);
      handleToast({ 
        title: "Failed to Stop Dialing", 
        description: "There was an error stopping the dialing process." 
      }, "destructive");
    }
  }, [currentJobId, dialStatus, user?.id, getAvailablePorts, handleToast]);

  const makeTestCall = useCallback(async (phoneNumber: string) => {
    if (!user?.id) {
      handleToast({ 
        title: "Authentication Required", 
        description: "You must be logged in to make test calls." 
      }, "destructive");
      return;
    }

    try {
      const result = await autoDialerService.makeTestCall(phoneNumber, campaignId, user.id);
      const variant = result.success ? "default" : "destructive";
      handleToast({ 
        title: result.success ? "Test Call Initiated" : "Test Call Failed", 
        description: result.message 
      }, variant);
      setTimeout(() => getAvailablePorts(), 1000);
    } catch (error) {
      console.error("Error making test call:", error);
      handleToast({ 
        title: "Test Call Failed", 
        description: "Could not initiate test call." 
      }, "destructive");
    }
  }, [campaignId, user?.id, getAvailablePorts, handleToast]);

  return {
    isDialing,
    currentJobId,
    dialStatus,
    availablePorts,
    startDialing,
    stopDialing,
    makeTestCall,
    refreshPortsStatus: getAvailablePorts,
  };
};
