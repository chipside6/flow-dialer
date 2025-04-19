
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { RefreshCw, PhoneOff, Cpu, Info } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { goipPortManager } from "@/utils/asterisk/services/goipPortManager";
import { amiMonitor } from "@/utils/asterisk/services/amiMonitor";
import { useToast } from "@/components/ui/use-toast";
import { usePollingInterval } from "@/hooks/usePollingInterval";

interface PortStatusMonitorProps {
  campaignId?: string;
}

export const PortStatusMonitor = ({ campaignId }: PortStatusMonitorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ports, setPorts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const fetchPorts = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const userPorts = await goipPortManager.getUserPorts(user.id);
      setPorts(userPorts);
      setLastUpdated(new Date());
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
      await amiMonitor.updatePortStatusFromAmi(user.id);
      await fetchPorts();
      
      toast({
        title: "Ports Synchronized",
        description: "Port status has been synchronized with Asterisk.",
      });
    } catch (error) {
      console.error("Error syncing ports with AMI:", error);
      
      toast({
        title: "Sync Failed",
        description: "Could not synchronize port status with Asterisk.",
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
      await goipPortManager.resetPorts(user.id);
      await fetchPorts();
      
      toast({
        title: "Ports Reset",
        description: "All ports have been reset to available status.",
      });
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
            <CardTitle className="text-xl">GoIP Port Status</CardTitle>
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
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
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
          <div className="text-center py-8 text-muted-foreground">
            <Cpu className="mx-auto h-12 w-12 mb-3 opacity-20" />
            <p>No GoIP ports have been configured</p>
            <p className="text-xs mt-2">Configure your GoIP device in Settings</p>
          </div>
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
            Sync AMI
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
