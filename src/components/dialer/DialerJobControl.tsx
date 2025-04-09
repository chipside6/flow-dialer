
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { startCampaign, pauseCampaign, stopCampaign, resumeCampaign } from '@/services/campaignService';

interface DialerJobControlProps {
  campaignId: string;
  status: string;
  onStatusChange: () => void;
}

export const DialerJobControl: React.FC<DialerJobControlProps> = ({
  campaignId,
  status,
  onStatusChange
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleStartCampaign = async () => {
    setIsLoading(true);
    try {
      await startCampaign(campaignId);
      toast({
        title: 'Campaign started',
        description: 'The campaign has been started successfully.',
      });
      onStatusChange();
    } catch (error) {
      console.error('Error starting campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to start campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseCampaign = async () => {
    setIsLoading(true);
    try {
      await pauseCampaign(campaignId);
      toast({
        title: 'Campaign paused',
        description: 'The campaign has been paused successfully.',
      });
      onStatusChange();
    } catch (error) {
      console.error('Error pausing campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to pause campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeCampaign = async () => {
    setIsLoading(true);
    try {
      await resumeCampaign(campaignId);
      toast({
        title: 'Campaign resumed',
        description: 'The campaign has been resumed successfully.',
      });
      onStatusChange();
    } catch (error) {
      console.error('Error resuming campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to resume campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopCampaign = async () => {
    setIsLoading(true);
    try {
      await stopCampaign(campaignId);
      toast({
        title: 'Campaign stopped',
        description: 'The campaign has been stopped successfully.',
      });
      onStatusChange();
    } catch (error) {
      console.error('Error stopping campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {status === 'pending' && (
        <Button
          onClick={handleStartCampaign}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Campaign
            </>
          )}
        </Button>
      )}

      {status === 'running' && (
        <>
          <Button
            onClick={handlePauseCampaign}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Pausing...
              </>
            ) : (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause Campaign
              </>
            )}
          </Button>
          <Button
            onClick={handleStopCampaign}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop Campaign
              </>
            )}
          </Button>
        </>
      )}

      {status === 'paused' && (
        <>
          <Button
            onClick={handleResumeCampaign}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resuming...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume Campaign
              </>
            )}
          </Button>
          <Button
            onClick={handleStopCampaign}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop Campaign
              </>
            )}
          </Button>
        </>
      )}

      {status === 'completed' && (
        <Button
          onClick={handleStartCampaign}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Restarting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Restart Campaign
            </>
          )}
        </Button>
      )}
    </div>
  );
};
