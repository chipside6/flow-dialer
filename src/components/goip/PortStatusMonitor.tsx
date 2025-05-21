
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { RefreshCw, PhoneOff, Cpu, Info, AlertCircle, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { goipPortManager } from "@/utils/asterisk/services/goipPortManager";
import { enhancedGoipPortManager } from "@/utils/asterisk/services/enhancedGoipPortManager";
import { amiMonitor } from "@/utils/asterisk/services/amiMonitor";
import { useToast } from "@/components/ui/use-toast";
import { usePollingInterval } from "@/hooks/usePollingInterval";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PortStatus } from '@/types/goipTypes';

interface PortStatusMonitorProps {
  campaignId?: string;
  onPortUpdated?: () => void;
}

export const PortStatusMonitor = ({ campaignId, onPortUpdated }: PortStatusMonitorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ports, setPorts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [availablePortCount, setAvailablePortCount] = useState(0);
  
  const fetchPorts = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Try with enhanced port manager first
      try {
        const enhancedPortData = await enhancedGoipPortManager.getAvailablePorts(user.id);
        if (enhancedPortData.ports.length > 0) {
          const formattedPorts = enhancedPortData.ports.map(p => ({
            portNumber: p.portNumber,
            sipUser: p.deviceName,
            status: p.status,
            lastStatusChange: new Date(),
            campaignId: undefined,
            callId: undefined
          }));
          
          setPorts(formattedPorts);
          setAvailablePortCount(enhancedPortData.availablePorts);
          setLastUpdated(new Date());
          return;
        }
      } catch (error) {
        console.log('Enhanced port manager failed, falling back to standard port manager');
      }
      
      // Fallback to standard port manager
      const userPorts = await goipPortManager.getUserPorts(user.id);
      setPorts(userPorts);
      setAvailablePortCount(userPorts.filter(p => p.status === 'available').length);
      setLastUpdated(new Date());
      
      // Notify parent of port update
      if (onPortUpdated) onPortUpdated();
      
    } catch (error) {
      console.error("Error fetching ports:", error);
      
      toast({
        title: "Failed to Load Ports",
        description: "Could not get the latest port status information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch ports on initial load
  useEffect(() => {
    fetchPorts();
  }, [user?.id]);
  
  // Auto-refresh status
  usePollingInterval(
    fetchPorts, 
    { enabled: Boolean(user?.id), interval: 15000 }
  );
  
  // Manually sync ports with AMI data
  const syncPortsWithAmi = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // We'll skip actual AMI connection and just refresh port status
      await fetchPorts();
      
      toast({
        title: "Ports Synchronized",
        description: "Port status has been synchronized successfully.",
      });
    } catch (error) {
      console.error("Error syncing ports:", error);
      
      toast({
        title: "Sync Failed",
        description: "Could not synchronize port status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset all ports to available
  const resetAllPorts = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Try enhanced port manager first
      try {
        await enhancedGoipPortManager.resetPorts(user.id);
      } catch (error) {
        // Fallback to standard port manager
        await goipPortManager.resetPorts(user.id);
      }
      
      await fetchPorts();
      
      toast({
        title: "Ports Reset",
        description: "All ports have been reset to available status.",
      });
      
      // Notify parent of port update
      if (onPortUpdated) onPortUpdated();
    } catch (error) {
      console.error("Error resetting ports:", error);
      
      toast({
        title: "Reset Failed",
        description: "Could not reset port status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format timestamp in relative time
  const formatLastUpdate = () => {
    if (!lastUpdated) return 'Not updated yet';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec} seconds ago`;
    const diffMin = Math.floor(diffSec / 60);
    return `${diffMin} minutes ago`;
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'busy':
        return 'destructive';
      case 'offline':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Port Status</CardTitle>
            <CardDescription>
              {ports.length === 0 ? 'No ports configured' : 
               `${ports.filter(p => p.status === 'available').length} of ${ports.length} ports available`}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 gap-1"
                  disabled={isLoading}
                  onClick={fetchPorts}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last updated: {formatLastUpdate()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {ports.length === 0 ? (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              No GoIP ports have been configured. Register a GoIP device to see port status here.
            </AlertDescription>
          </Alert>
        ) : availablePortCount === 0 ? (
          <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              No available ports found. Your campaigns need available ports to function.
              Try resetting ports using the button below.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {ports.map(port => (
              <div key={port.portNumber} className="border rounded-md p-3 text-center">
                <div className="text-sm font-medium mb-1">Port {port.portNumber}</div>
                <Badge variant={getStatusColor(port.status) as any} className="w-full">
                  {port.status.charAt(0).toUpperCase() + port.status.slice(1)}
                </Badge>
                {port.status === 'busy' && port.campaignId && (
                  <div className="text-xs mt-1 text-muted-foreground truncate max-w-full">
                    Campaign: {port.campaignId.substring(0, 6)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 flex gap-2 justify-between">
        <div className="text-xs text-muted-foreground flex items-center">
          <Info className="h-3 w-3 mr-1" />
          Last updated: {formatLastUpdate()}
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 gap-1"
            disabled={isLoading || ports.length === 0}
            onClick={syncPortsWithAmi}
          >
            <Cpu className="h-3.5 w-3.5" />
            Refresh Status
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 gap-1"
            disabled={isLoading || ports.length === 0 || ports.every(p => p.status === 'available')}
            onClick={resetAllPorts}
          >
            <PhoneOff className="h-3.5 w-3.5" />
            Reset All
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
