
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, PauseCircle, PlayCircle, StopCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface DialerJobControlProps {
  campaignId: string;
  campaignStatus?: string;
  refetchCampaign: () => Promise<void>;
}

export const DialerJobControl: React.FC<DialerJobControlProps> = ({
  campaignId,
  campaignStatus = 'idle',
  refetchCampaign
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleStartCampaign = async () => {
    setIsLoading(true);
    try {
      // Mock implementation - in a real app, you would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Campaign started",
        description: "Your campaign has been started successfully"
      });
      await refetchCampaign();
    } catch (error) {
      console.error('Error starting campaign:', error);
      toast({
        title: "Failed to start campaign",
        description: "There was an error starting your campaign",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePauseCampaign = async () => {
    setIsLoading(true);
    try {
      // Mock implementation - in a real app, you would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Campaign paused",
        description: "Your campaign has been paused"
      });
      await refetchCampaign();
    } catch (error) {
      console.error('Error pausing campaign:', error);
      toast({
        title: "Failed to pause campaign",
        description: "There was an error pausing your campaign",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStopCampaign = async () => {
    setIsLoading(true);
    try {
      // Mock implementation - in a real app, you would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Campaign stopped",
        description: "Your campaign has been stopped"
      });
      await refetchCampaign();
    } catch (error) {
      console.error('Error stopping campaign:', error);
      toast({
        title: "Failed to stop campaign",
        description: "There was an error stopping your campaign",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusBadge = () => {
    switch (campaignStatus) {
      case 'running':
        return <Badge className="bg-green-500">Running</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'stopped':
        return <Badge className="bg-red-500">Stopped</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-medium">Dialer Control</h3>
          </div>
          <div className="flex items-center">
            <span className="mr-2">Status:</span>
            {getStatusBadge()}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleStartCampaign}
            disabled={isLoading || campaignStatus === 'running' || campaignStatus === 'completed'}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
            {campaignStatus === 'paused' ? 'Resume' : 'Start'} Campaign
          </Button>
          
          <Button 
            onClick={handlePauseCampaign}
            disabled={isLoading || campaignStatus !== 'running'}
            variant="outline"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <PauseCircle className="h-4 w-4 mr-2" />}
            Pause Campaign
          </Button>
          
          <Button 
            onClick={handleStopCampaign}
            disabled={isLoading || campaignStatus === 'stopped' || campaignStatus === 'completed'}
            variant="destructive"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <StopCircle className="h-4 w-4 mr-2" />}
            Stop Campaign
          </Button>
        </div>
      </div>
    </Card>
  );
};
