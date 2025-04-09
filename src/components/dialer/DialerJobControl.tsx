
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Play, Square, Clock, BarChart, Phone, CheckCircle, XCircle } from 'lucide-react';
import { useDialerJobs } from '@/hooks/useDialerJobs';
import { usePollingInterval } from '@/hooks/usePollingInterval';

interface DialerJobControlProps {
  campaignId: string;
  disabled?: boolean;
}

export const DialerJobControl: React.FC<DialerJobControlProps> = ({ 
  campaignId,
  disabled = false
}) => {
  const { toast } = useToast();
  const { startJob, cancelJob, getJobStatus, currentJob, isLoading } = useDialerJobs(campaignId);
  
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
  });
  
  // Poll for updates when a job is running
  usePollingInterval(
    async () => {
      if (!currentJob || status === 'completed' || status === 'failed' || status === 'cancelled') return;
      
      try {
        const jobStatus = await getJobStatus(currentJob.id);
        
        if (jobStatus) {
          updateStatus(jobStatus);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    },
    { 
      enabled: Boolean(currentJob && ['running', 'in_progress'].includes(status)), 
      interval: 3000 
    }
  );
  
  // Initialize from current job when it loads
  useEffect(() => {
    if (currentJob) {
      updateStatus(currentJob);
    } else {
      setStatus('idle');
      setProgress(0);
      setStats({
        total: 0,
        completed: 0,
        successful: 0,
        failed: 0,
      });
    }
  }, [currentJob]);
  
  // Update the status and stats from job data
  const updateStatus = (job: any) => {
    setStatus(job.status);
    
    const total = job.total_calls || 0;
    const completed = job.completed_calls || 0;
    const successful = job.successful_calls || 0;
    const failed = job.failed_calls || 0;
    
    setStats({
      total,
      completed,
      successful,
      failed,
    });
    
    // Calculate progress percentage
    if (total > 0) {
      setProgress(Math.round((completed / total) * 100));
    } else {
      setProgress(0);
    }
  };
  
  // Start the dialer job
  const handleStartJob = async () => {
    if (disabled || isLoading) return;
    
    try {
      const jobId = await startJob(campaignId);
      
      if (jobId) {
        toast({
          title: 'Dialer started',
          description: 'The autodialer job has been started successfully'
        });
      }
    } catch (error) {
      console.error('Error starting dialer job:', error);
      toast({
        title: 'Failed to start dialer',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };
  
  // Cancel the dialer job
  const handleCancelJob = async () => {
    if (!currentJob || isLoading) return;
    
    try {
      const success = await cancelJob(currentJob.id);
      
      if (success) {
        toast({
          title: 'Dialer cancelled',
          description: 'The autodialer job has been cancelled'
        });
      }
    } catch (error) {
      console.error('Error cancelling dialer job:', error);
      toast({
        title: 'Failed to cancel dialer',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };
  
  // Get status badge color
  const getStatusBadge = () => {
    switch (status) {
      case 'idle':
        return <Badge variant="secondary">Ready</Badge>;
      case 'pending':
      case 'in_progress':
      case 'running':
        return <Badge variant="default">Running</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Dialer</CardTitle>
        <CardDescription>Start or manage the autodialer for this campaign</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Status</p>
              {getStatusBadge()}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Progress</p>
              <p className="text-sm text-muted-foreground">
                {stats.completed} / {stats.total} calls
              </p>
            </div>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <Phone className="h-5 w-5 mb-1 text-muted-foreground" />
            <p className="text-xl font-semibold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Calls</p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <CheckCircle className="h-5 w-5 mb-1 text-green-500" />
            <p className="text-xl font-semibold">{stats.successful}</p>
            <p className="text-xs text-muted-foreground">Successful</p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <XCircle className="h-5 w-5 mb-1 text-red-500" />
            <p className="text-xl font-semibold">{stats.failed}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        {['idle', 'cancelled', 'completed', 'failed'].includes(status) ? (
          <Button 
            className="w-full" 
            onClick={handleStartJob}
            disabled={disabled || isLoading}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Dialing
          </Button>
        ) : (
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={handleCancelJob}
            disabled={isLoading}
          >
            <Square className="h-4 w-4 mr-2" />
            Cancel Dialing
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
