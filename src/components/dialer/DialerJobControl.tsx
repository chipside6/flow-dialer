
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DialerJobControlProps {
  isRunning: boolean;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  remainingCalls?: number;
  completedCalls?: number;
  campaignStatus?: string;
}

export const DialerJobControl: React.FC<DialerJobControlProps> = ({
  isRunning,
  isLoading,
  onStart,
  onStop,
  remainingCalls = 0,
  completedCalls = 0,
  campaignStatus = 'ready'
}) => {
  const getStatusBadge = () => {
    switch (campaignStatus) {
      case 'running':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'stopped':
        return <Badge className="bg-red-500">Stopped</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Dialer Controls</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/50 p-3 rounded">
            <div className="text-sm text-muted-foreground">Remaining</div>
            <div className="text-2xl font-bold">{remainingCalls}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded">
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-2xl font-bold">{completedCalls}</div>
          </div>
        </div>

        <div className="flex gap-3">
          {isRunning ? (
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onStop}
              disabled={isLoading || campaignStatus === 'completed'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Dialer
                </>
              )}
            </Button>
          ) : (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onStart}
              disabled={
                isLoading || 
                remainingCalls === 0 || 
                campaignStatus === 'completed' || 
                campaignStatus === 'error'
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Dialer
                </>
              )}
            </Button>
          )}
        </div>

        {campaignStatus === 'error' && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm flex items-center text-red-800">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
            There was an error with the dialer. Please check logs.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
