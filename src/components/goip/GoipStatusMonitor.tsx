
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, RefreshCw, Info, Loader2, AlertCircle, Check } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { goipPortManager } from "@/utils/asterisk/services/goipPortManager";
import { dialingService } from "@/utils/asterisk/dialingService";

export const GoipStatusMonitor: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ports, setPorts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingPort, setIsTestingPort] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load ports status
  useEffect(() => {
    if (user?.id) {
      loadPorts();
    }
  }, [user?.id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) {
        loadPorts(false);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadPorts = async (showToast = true) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      const userPorts = await goipPortManager.getUserPorts(user.id);
      setPorts(userPorts);
      setLastUpdated(new Date());
      
      if (showToast) {
        toast({
          title: "Ports Status Updated",
          description: `Found ${userPorts.length} ports. ${userPorts.filter(p => p.status === 'available').length} are available.`
        });
      }
    } catch (error) {
      console.error("Error loading ports:", error);
      
      if (showToast) {
        toast({
          title: "Error Loading Ports",
          description: "Could not retrieve port status. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Test a specific port
  const testPort = async (portNumber: number) => {
    if (!user?.id) return;
    
    setIsTestingPort(portNumber);
    
    try {
      // Use your own phone number for the test call
      const phoneNumber = prompt("Enter your phone number to receive a test call:");
      
      if (!phoneNumber) {
        setIsTestingPort(null);
        return;
      }
      
      const result = await dialingService.makeTestCall(phoneNumber, user.id, portNumber);
      
      toast({
        title: result.success ? "Test Call Initiated" : "Test Call Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
      // Refresh ports after test call
      setTimeout(() => loadPorts(false), 2000);
    } catch (error) {
      console.error("Error testing port:", error);
      toast({
        title: "Test Failed",
        description: "Could not initiate test call. Please check your system configuration.",
        variant: "destructive"
      });
    } finally {
      setIsTestingPort(null);
    }
  };

  // Reset all ports
  const resetAllPorts = async () => {
    if (!user?.id) return;
    
    if (!confirm("This will reset all ports to available status. Any active calls may be disconnected. Continue?")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await goipPortManager.resetPorts(user.id);
      await loadPorts();
      
      toast({
        title: "Ports Reset",
        description: "All ports have been reset to available status.",
      });
    } catch (error) {
      console.error("Error resetting ports:", error);
      toast({
        title: "Reset Failed",
        description: "Could not reset port status.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPortStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format relative time
  const getRelativeTime = () => {
    if (!lastUpdated) return 'Not updated yet';
    
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" /> 
              GoIP Port Status
            </CardTitle>
            <CardDescription>
              {isLoading ? 'Checking port status...' : 
                ports.length === 0 ? 'No ports configured' : 
                `${ports.filter(p => p.status === 'available').length} of ${ports.length} ports available for campaigns`}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadPorts()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {ports.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No GoIP ports found. Please register a GoIP device first.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ports.map(port => (
                <div 
                  key={`${port.portNumber}`} 
                  className={`border rounded-md p-3 ${getPortStatusColor(port.status)}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Port {port.portNumber}</h3>
                    <Badge variant={port.status === 'available' ? 'success' : 'destructive'}>
                      {port.status === 'available' ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                  <p className="text-xs mb-3">SIP: {port.sipUser}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => testPort(port.portNumber)}
                    disabled={isTestingPort !== null || port.status !== 'available'}
                  >
                    {isTestingPort === port.portNumber ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Phone className="h-3 w-3 mr-1" />
                        Test Port
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Port Troubleshooting</h3>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">How to know if ports are working</p>
                  <p className="text-sm mt-1">
                    1. Check the status above - ports should show as "Available"
                  </p>
                  <p className="text-sm">
                    2. Use the "Test Port" button to make a test call to your phone
                  </p>
                  <p className="text-sm">
                    3. If you receive the call, the port is working correctly
                  </p>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Last updated: {getRelativeTime()}
                </p>
                <Button 
                  variant="outline" 
                  onClick={resetAllPorts}
                  disabled={isLoading || ports.every(p => p.status === 'available')}
                  size="sm"
                >
                  Reset All Ports
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground w-full">
          <p className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-1" />
            <span>Available ports</span>
            <span className="mx-1">•</span>
            <span className="text-xs">Ready to make calls for your campaigns</span>
          </p>
          <p className="flex items-center mt-1">
            <AlertCircle className="h-4 w-4 text-red-600 mr-1" />
            <span>Busy ports</span>
            <span className="mx-1">•</span>
            <span className="text-xs">Currently being used for active calls</span>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};
