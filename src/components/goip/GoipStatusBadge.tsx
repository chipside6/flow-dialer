
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { checkGoipStatus } from '@/services/campaignService';
import { useIsMobile } from '@/hooks/use-mobile';

interface GoipStatusBadgeProps {
  userId: string;
  portNumber?: number;
  refreshInterval?: number | null;
}

export const GoipStatusBadge = ({ 
  userId, 
  portNumber = 1, 
  refreshInterval = 30000 
}: GoipStatusBadgeProps) => {
  const [status, setStatus] = useState<{ online: boolean; message: string; lastSeen?: string | null; }>({
    online: false,
    message: 'Checking status...'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  
  const fetchStatus = async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    
    try {
      const result = await checkGoipStatus(userId, portNumber);
      setStatus(result);
    } catch (error) {
      console.error('Error checking GoIP status:', error);
      setStatus({
        online: false,
        message: 'Error checking status'
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, [userId, portNumber]);
  
  // Set up refresh interval if provided
  useEffect(() => {
    if (!refreshInterval) return;
    
    const interval = setInterval(fetchStatus, refreshInterval);
    
    return () => clearInterval(interval);
  }, [userId, portNumber, refreshInterval]);
  
  return (
    <div className="inline-flex">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={status.online ? "success" : "destructive"}
              className="flex items-center gap-1"
            >
              {isRefreshing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : status.online ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span>{isMobile ? '' : (status.online ? 'Online' : 'Offline')}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p><strong>Status:</strong> {status.message}</p>
              {status.lastSeen && (
                <p><strong>Last seen:</strong> {new Date(status.lastSeen).toLocaleString()}</p>
              )}
              <p className="text-muted-foreground mt-1">GoIP Port: {portNumber}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
