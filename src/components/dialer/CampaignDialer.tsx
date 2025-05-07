
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { autoDialerService } from '@/services/autodialer/autoDialerService';
import { useAuth } from '@/contexts/auth';
import { Phone, Pause, StopCircle, Play, CheckCircle, XCircle } from 'lucide-react';

interface CampaignDialerProps {
  campaignId: string;
  selectedPorts: number[];
  transferNumber?: string;
  greetingFileUrl?: string;
}

type JobStatus = 'pending' | 'starting' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed';

const CampaignDialer: React.FC<CampaignDialerProps> = ({
  campaignId,
  selectedPorts,
  transferNumber,
  greetingFileUrl
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>('pending');
  const [progress, setProgress] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [completedCalls, setCompletedCalls] = useState(0);
  const [successfulCalls, setSuccessfulCalls] = useState(0);
  const [failedCalls, setFailedCalls] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Poll for status updates when a job is running
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (jobId && (status === 'running' || status === 'starting')) {
      intervalId = setInterval(checkJobStatus, 3000) as unknown as number;
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, status]);

  // Calculate progress when values change
  useEffect(() => {
    if (totalCalls > 0) {
      setProgress(Math.floor((completedCalls / totalCalls) * 100));
    }
  }, [completedCalls, totalCalls]);

  const checkJobStatus = async () => {
    if (!jobId) return;
    
    try {
      const result = await autoDialerService.getCampaignStatus(jobId);
      
      if (result.success && result.status) {
        setStatus(result.status.status);
        setTotalCalls(result.status.totalCalls);
        setCompletedCalls(result.status.completedCalls);
        setSuccessfulCalls(result.status.successfulCalls);
        setFailedCalls(result.status.failedCalls);
        
        if (['completed', 'cancelled', 'failed'].includes(result.status.status)) {
          toast({
            title: `Campaign ${result.status.status}`,
            description: `Campaign has ${result.status.status}. ${result.status.successfulCalls} successful calls, ${result.status.failedCalls} failed.`,
            variant: result.status.status === 'completed' ? 'default' : 'destructive'
          });
        }
      }
    } catch (err) {
      console.error('Error checking job status:', err);
    }
  };

  const handleStartCampaign = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    if (selectedPorts.length === 0) {
      setError('No ports selected for dialing');
      return;
    }

    setError(null);
    setIsStarting(true);

    try {
      const result = await autoDialerService.startCampaign({
        campaignId,
        userId: user.id,
        portNumbers: selectedPorts,
        transferNumber,
        greetingFileUrl
      });

      if (result.success && result.jobId) {
        setJobId(result.jobId);
        setStatus('starting');
        toast({
          title: 'Campaign Started',
          description: `Campaign is starting with ${selectedPorts.length} ports.`,
        });
      } else {
        setError(result.message);
        toast({
          title: 'Error Starting Campaign',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error starting campaign:', err);
      setError(err instanceof Error ? err.message : 'Unknown error starting campaign');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancelCampaign = async () => {
    if (!jobId || !user?.id) return;
    
    setIsCancelling(true);
    
    try {
      const result = await autoDialerService.cancelCampaign(jobId, user.id);
      
      if (result.success) {
        setStatus('cancelled');
        toast({
          title: 'Campaign Cancelled',
          description: 'Campaign has been cancelled.',
        });
      } else {
        toast({
          title: 'Error Cancelling Campaign',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error cancelling campaign:', err);
      toast({
        title: 'Error Cancelling Campaign',
        description: err instanceof Error ? err.message : 'Unknown error cancelling campaign',
        variant: 'destructive'
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'running':
        return 'default';
      case 'completed':
        return 'success';
      case 'starting':
        return 'outline';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      case 'paused':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Campaign Dialer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(status !== 'pending' && jobId) && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant={getStatusBadgeVariant()}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Job ID: {jobId.substring(0, 8)}...
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress: {progress}%</span>
                <span>
                  {completedCalls} / {totalCalls} calls
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Successful: {successfulCalls}</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span>Failed: {failedCalls}</span>
              </div>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="py-4 text-center text-muted-foreground">
            <p>Ready to start campaign with {selectedPorts.length} ports</p>
            <p className="text-sm">
              Transfer number: {transferNumber || 'None configured'}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {status === 'pending' && (
          <Button
            onClick={handleStartCampaign}
            disabled={isStarting || selectedPorts.length === 0}
          >
            {isStarting ? 'Starting...' : 'Start Campaign'}
          </Button>
        )}

        {(status === 'running' || status === 'starting') && (
          <Button
            variant="destructive"
            onClick={handleCancelCampaign}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Campaign'}
          </Button>
        )}

        {/* Future implementation 
        {status === 'paused' && (
          <Button
            variant="outline"
            onClick={() => {}}
            disabled={isStarting}
          >
            <Play className="h-4 w-4 mr-2" />
            Resume
          </Button>
        )}

        {status === 'running' && (
          <Button
            variant="outline"
            onClick={() => {}}
            disabled={isPausing}
          >
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
        )}
        */}
      </CardFooter>
    </Card>
  );
};

export default CampaignDialer;
