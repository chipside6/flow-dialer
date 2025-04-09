
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Phone, PhoneOff, RefreshCw, PlayCircle, StopCircle } from 'lucide-react';
import { useDialerJobs } from '@/hooks/useDialerJobs';
import { useCallLogs } from '@/hooks/useCallLogs';
import { useToast } from '@/components/ui/use-toast';

interface DialerJobControlProps {
  campaignId: string;
  disabled?: boolean;
}

export const DialerJobControl: React.FC<DialerJobControlProps> = ({ 
  campaignId,
  disabled = false
}) => {
  const { toast } = useToast();
  const { 
    startJob, 
    cancelJob, 
    currentJob, 
    isLoading: isJobLoading 
  } = useDialerJobs(campaignId);
  
  const { 
    logs, 
    stats, 
    refresh: refreshLogs, 
    isLoading: isLogsLoading 
  } = useCallLogs({ 
    campaignId, 
    refreshInterval: 
    (currentJob?.status === 'in_progress') ? 5000 : null 
  });
  
  const [isStarting, setIsStarting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [progress, setProgress] = useState(0);

  // Update progress when job status changes
  useEffect(() => {
    if (currentJob) {
      const completed = currentJob.completed_calls || 0;
      const total = currentJob.total_calls || 1; // Avoid division by zero
      const calculatedProgress = Math.round((completed / total) * 100);
      setProgress(calculatedProgress);
    } else {
      setProgress(0);
    }
  }, [currentJob]);

  // Handle starting a new dialer job
  const handleStartJob = async () => {
    if (disabled || isStarting) return;
    
    setIsStarting(true);
    
    try {
      const jobId = await startJob(campaignId);
      
      if (!jobId) {
        toast({
          title: 'Failed to start dialer job',
          description: 'Please check the campaign configuration and try again',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Dialer job started',
          description: 'The system has started making calls for this campaign'
        });
        
        // Refresh logs after a short delay
        setTimeout(refreshLogs, 2000);
      }
    } catch (error) {
      console.error('Error starting dialer job:', error);
      toast({
        title: 'Error starting dialer job',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsStarting(false);
    }
  };

  // Handle cancelling a dialer job
  const handleCancelJob = async () => {
    if (!currentJob || isCancelling) return;
    
    setIsCancelling(true);
    
    try {
      const success = await cancelJob(currentJob.id);
      
      if (success) {
        toast({
          title: 'Dialer job cancelled',
          description: 'The dialer job has been cancelled successfully'
        });
        
        // Refresh logs after a short delay
        setTimeout(refreshLogs, 2000);
      } else {
        toast({
          title: 'Failed to cancel dialer job',
          description: 'The system could not cancel the dialer job',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error cancelling dialer job:', error);
      toast({
        title: 'Error cancelling dialer job',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Get status badge color based on job status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Format job status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const isRunning = currentJob?.status === 'in_progress';
  const isCompleted = ['completed', 'failed', 'cancelled'].includes(currentJob?.status || '');
  const isLoading = isJobLoading || isLogsLoading || isStarting || isCancelling;

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Autodialer Status
        </CardTitle>
        <CardDescription>
          Monitor and control the autodialer for this campaign
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {currentJob ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium">Job Status:</p>
                <Badge variant={getStatusBadgeVariant(currentJob.status)}>
                  {formatStatus(currentJob.status)}
                </Badge>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshLogs}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {isRunning && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progress:</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {currentJob.completed_calls || 0} of {currentJob.total_calls || 0} calls completed
                </p>
              </div>
            )}
            
            {isCompleted && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Calls:</p>
                  <p className="text-2xl font-bold">{currentJob.total_calls || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Successful:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {currentJob.successful_calls || 0}
                  </p>
                </div>
              </div>
            )}
            
            {logs.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-sm font-medium">Call Summary:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted rounded-md">
                    <p className="text-sm font-medium">Human</p>
                    <p className="text-xl">{stats.human}</p>
                  </div>
                  <div className="p-2 bg-muted rounded-md">
                    <p className="text-sm font-medium">Voicemail</p>
                    <p className="text-xl">{stats.voicemail}</p>
                  </div>
                  <div className="p-2 bg-muted rounded-md">
                    <p className="text-sm font-medium">Transfers</p>
                    <p className="text-xl">{stats.transfers}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <PhoneOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No dialer job running for this campaign</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click the button below to start making calls
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        {isRunning ? (
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleCancelJob}
            disabled={disabled || isLoading}
          >
            {isCancelling ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <StopCircle className="h-4 w-4 mr-2" />
                Stop Autodialer
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="w-full"
            onClick={handleStartJob}
            disabled={disabled || isLoading || isCompleted}
          >
            {isStarting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Autodialer
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
