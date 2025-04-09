import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Stop, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from '@tanstack/react-query';
import { pauseCampaign, resumeCampaign, stopCampaign } from '@/services/campaignService';

interface DialerJobControlProps {
  campaignId: string | undefined;
  campaignStatus: string | null | undefined;
  refetchCampaign: () => void;
}

export const DialerJobControl = ({ campaignId, campaignStatus, refetchCampaign }: DialerJobControlProps) => {
  const { toast } = useToast();
  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [canPause, setCanPause] = useState(false);
  const [canStop, setCanStop] = useState(false);

  // Mutations for campaign control
  const pauseMutation = useMutation(pauseCampaign, {
    onSuccess: () => {
      toast({
        title: "Campaign Paused",
        description: "The campaign has been paused successfully.",
        variant: "default"
      });
      refetchCampaign();
    },
    onError: (error: any) => {
      toast({
        title: "Error Pausing Campaign",
        description: error.message || "Failed to pause the campaign. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsPausing(false);
    }
  });

  const resumeMutation = useMutation(resumeCampaign, {
    onSuccess: () => {
      toast({
        title: "Campaign Resumed",
        description: "The campaign has been resumed successfully.",
      });
      refetchCampaign();
    },
    onError: (error: any) => {
      toast({
        title: "Error Resuming Campaign",
        description: error.message || "Failed to resume the campaign. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsResuming(false);
    }
  });

  const stopMutation = useMutation(stopCampaign, {
    onSuccess: () => {
      toast({
        title: "Campaign Stopped",
        description: "The campaign has been stopped successfully.",
      });
      refetchCampaign();
    },
    onError: (error: any) => {
      toast({
        title: "Error Stopping Campaign",
        description: error.message || "Failed to stop the campaign. Please try again.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsStopping(false);
    }
  });

  useEffect(() => {
    // Determine button states based on campaign status
    setCanStart(campaignStatus === 'created' || campaignStatus === 'paused');
    setCanPause(campaignStatus === 'running');
    setCanStop(campaignStatus === 'running' || campaignStatus === 'paused');
  }, [campaignStatus]);

  const handlePause = async () => {
    if (!campaignId) {
      toast({
        title: "Campaign ID Missing",
        description: "Campaign ID is required to pause the campaign.",
        variant: "destructive"
      });
      return;
    }

    setIsPausing(true);
    pauseMutation.mutate(campaignId);
  };

  const handleResume = async () => {
    if (!campaignId) {
       toast({
        title: "Campaign ID Missing",
        description: "Campaign ID is required to resume the campaign.",
        variant: "destructive"
      });
      return;
    }

    setIsResuming(true);
    resumeMutation.mutate(campaignId);
  };

  const handleStop = async () => {
    if (!campaignId) {
      toast({
        title: "Campaign ID Missing",
        description: "Campaign ID is required to stop the campaign.",
        variant: "destructive"
      });
      return;
    }

    setIsStopping(true);
    stopMutation.mutate(campaignId);
  };

  return (
    <div className="flex space-x-2">
      {canStart && (
        <Button
          onClick={handleResume}
          disabled={isResuming}
        >
          {isResuming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resuming
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Resume
            </>
          )}
        </Button>
      )}

      {canPause && (
        <Button
          onClick={handlePause}
          disabled={isPausing}
        >
          {isPausing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Pausing
            </>
          ) : (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </>
          )}
        </Button>
      )}

      {canStop && (
        <Button
          variant="destructive"
          onClick={handleStop}
          disabled={isStopping}
        >
          {isStopping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Stopping
            </>
          ) : (
            <>
              <Stop className="mr-2 h-4 w-4" />
              Stop
            </>
          )}
        </Button>
      )}
    </div>
  );
};
