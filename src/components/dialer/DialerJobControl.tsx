
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Play, StopCircle, RefreshCw } from 'lucide-react';
import { PortSelector } from '@/components/dialer/PortSelector';
import { useAuth } from '@/contexts/auth';
import { useDialerJobs } from '@/hooks/useDialerJobs';
import { supabase } from '@/integrations/supabase/client';

interface DialerJobControlProps {
  campaignId: string;
  disabled?: boolean;
}

export const DialerJobControl = ({ campaignId, disabled = false }: DialerJobControlProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startJob, cancelJob, currentJob, isLoading } = useDialerJobs(campaignId);
  const [portNumber, setPortNumber] = useState<number>(1);
  const [isSavingPort, setIsSavingPort] = useState(false);

  // Load saved port number from campaign
  useEffect(() => {
    if (campaignId && user?.id) {
      loadPortNumber();
    }
  }, [campaignId, user?.id]);

  // Load saved port number from campaign
  const loadPortNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('port_number')
        .eq('id', campaignId)
        .single();
        
      if (error) throw error;
      
      if (data && data.port_number) {
        setPortNumber(data.port_number);
      }
    } catch (err) {
      console.error('Error loading port number:', err);
    }
  };

  // Handle port change
  const handlePortChange = async (port: number) => {
    setPortNumber(port);
    setIsSavingPort(true);
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ port_number: port })
        .eq('id', campaignId);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error saving port number:', err);
      toast({
        title: 'Error saving port number',
        description: 'Could not save the selected port number.',
        variant: 'destructive'
      });
    } finally {
      setIsSavingPort(false);
    }
  };

  // Handle start job button click
  const handleStartJob = async () => {
    if (!campaignId || disabled) {
      return;
    }
    
    try {
      const jobId = await startJob(campaignId);
      
      if (jobId) {
        toast({
          title: 'Dialer job started',
          description: 'The system is now making calls for your campaign',
        });
      }
    } catch (err) {
      console.error('Error starting dialer job:', err);
      toast({
        title: 'Error starting dialer job',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  // Handle cancel job button click
  const handleCancelJob = async () => {
    if (!currentJob?.id) {
      return;
    }
    
    try {
      const success = await cancelJob(currentJob.id);
      
      if (success) {
        toast({
          title: 'Dialer job cancelled',
          description: 'The dialer job has been cancelled',
        });
      }
    } catch (err) {
      console.error('Error cancelling dialer job:', err);
      toast({
        title: 'Error cancelling dialer job',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  // Get status badge based on job status
  const getStatusBadge = () => {
    if (!currentJob) {
      return <Badge variant="outline">Not Started</Badge>;
    }
    
    switch (currentJob.status) {
      case 'running':
        return <Badge variant="default">Running</Badge>;
      case 'pending':
        return <Badge variant="secondary">Starting...</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="warning">Cancelled</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{currentJob.status}</Badge>;
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!currentJob || currentJob.total_calls === 0) {
      return 0;
    }
    
    return Math.min(100, Math.round((currentJob.completed_calls / currentJob.total_calls) * 100));
  };

  // Check if job is running
  const isJobRunning = currentJob && ['running', 'pending'].includes(currentJob.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Call Control</CardTitle>
            <CardDescription>Start or stop the auto-dialer for this campaign</CardDescription>
          </div>
          <div>
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PortSelector
            selectedPort={portNumber}
            onPortChange={handlePortChange}
            campaignId={campaignId}
            disabled={isJobRunning || isSavingPort}
          />
          
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Call Progress
              </div>
              <div className="text-sm text-muted-foreground">
                {currentJob ? `${currentJob.completed_calls}/${currentJob.total_calls} calls` : '0/0 calls'}
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Successful</div>
              <div className="text-2xl font-bold">{currentJob?.successful_calls || 0}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Failed</div>
              <div className="text-2xl font-bold">{currentJob?.failed_calls || 0}</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isJobRunning ? (
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCancelJob}
                disabled={isLoading}
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Stop Dialer
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="w-full"
                onClick={handleStartJob}
                disabled={isLoading || disabled || !portNumber}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Dialer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
