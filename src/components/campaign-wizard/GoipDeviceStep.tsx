
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, AlertCircle, Info } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { asteriskService } from '@/utils/asteriskService';
import { Button } from "@/components/ui/button";

interface GoipDeviceStepProps {
  selectedDeviceId: string;
  selectedPortIds: string[];
  onDeviceChange: (deviceId: string) => void;
  onPortsChange: (portIds: string[]) => void;
}

export const GoipDeviceStep: React.FC<GoipDeviceStepProps> = ({
  selectedDeviceId,
  selectedPortIds,
  onDeviceChange,
  onPortsChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isLoadingPorts, setIsLoadingPorts] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [portStatus, setPortStatus] = useState<Record<string, boolean>>({});
  
  // Load devices
  useEffect(() => {
    if (user?.id) {
      loadDevices();
    }
  }, [user?.id]);
  
  // Load ports when device changes
  useEffect(() => {
    if (selectedDeviceId) {
      loadPorts(selectedDeviceId);
    } else {
      setPorts([]);
    }
  }, [selectedDeviceId]);
  
  // Load the user's GoIP devices
  const loadDevices = async () => {
    if (!user?.id) return;
    
    setIsLoadingDevices(true);
    
    try {
      const { data, error } = await supabase
        .from('goip_devices')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setDevices(data);
        
        // If no device is selected, select the first one
        if (!selectedDeviceId) {
          onDeviceChange(data[0].id);
        }
      } else {
        toast({
          title: "No GoIP devices found",
          description: "Please add a GoIP device in your account settings before continuing",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading GoIP devices:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error loading GoIP devices',
        variant: "destructive"
      });
    } finally {
      setIsLoadingDevices(false);
    }
  };
  
  // Load ports for a specific device
  const loadPorts = async (deviceId: string) => {
    if (!user?.id) return;
    
    setIsLoadingPorts(true);
    
    try {
      const { data, error } = await supabase
        .from('goip_ports')
        .select('*')
        .eq('device_id', deviceId)
        .order('port_number', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setPorts(data);
        
        // Reset selected ports when device changes
        onPortsChange([]);
        
        // Check status of ports
        checkPortsStatus(data);
      }
    } catch (error) {
      console.error('Error loading GoIP ports:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error loading GoIP ports',
        variant: "destructive"
      });
    } finally {
      setIsLoadingPorts(false);
    }
  };
  
  // Check status of ports
  const checkPortsStatus = async (portsToCheck: any[]) => {
    if (!user?.id || portsToCheck.length === 0) return;
    
    setIsCheckingStatus(true);
    
    try {
      const portStatusMap: Record<string, boolean> = {};
      
      // Check each port status
      for (const port of portsToCheck) {
        try {
          const result = await asteriskService.checkGoipStatus(user.id, port.port_number);
          portStatusMap[port.id] = result.online;
        } catch (error) {
          console.error(`Error checking port ${port.port_number} status:`, error);
          portStatusMap[port.id] = false;
        }
      }
      
      setPortStatus(portStatusMap);
    } catch (error) {
      console.error('Error checking port status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };
  
  // Handle device selection
  const handleDeviceSelect = (value: string) => {
    onDeviceChange(value);
  };
  
  // Handle port selection/deselection
  const handlePortToggle = (portId: string) => {
    const isSelected = selectedPortIds.includes(portId);
    
    if (isSelected) {
      // Remove port
      onPortsChange(selectedPortIds.filter(id => id !== portId));
    } else {
      // Add port
      onPortsChange([...selectedPortIds, portId]);
    }
  };
  
  // Refresh port status
  const handleRefreshStatus = () => {
    checkPortsStatus(ports);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            GoIP Device Selection
          </CardTitle>
          <CardDescription>
            Select which GoIP device and ports to use for this campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.length === 0 && !isLoadingDevices ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No GoIP devices found. Please add a GoIP device in your account settings before continuing.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="goipDevice">GoIP Device</Label>
                <Select 
                  value={selectedDeviceId} 
                  onValueChange={handleDeviceSelect}
                  disabled={isLoadingDevices}
                >
                  <SelectTrigger id="goipDevice">
                    <SelectValue placeholder={isLoadingDevices ? "Loading devices..." : "Select a GoIP device"} />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map(device => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.device_name} {device.ip_address ? `(${device.ip_address})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedDeviceId && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Available Ports</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRefreshStatus}
                      disabled={isCheckingStatus || ports.length === 0}
                    >
                      Refresh Status
                    </Button>
                  </div>
                  
                  {isLoadingPorts ? (
                    <div className="py-4 text-center text-muted-foreground">
                      Loading ports...
                    </div>
                  ) : ports.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No ports found for this device. Please add ports in your device configuration.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {ports.map(port => {
                        const isOnline = portStatus[port.id] === true;
                        
                        return (
                          <div 
                            key={port.id}
                            className={`
                              border rounded-md p-3 flex items-start space-x-3
                              ${isOnline ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
                              ${selectedPortIds.includes(port.id) ? 'ring-2 ring-primary' : ''}
                            `}
                          >
                            <Checkbox 
                              id={`port-${port.id}`}
                              checked={selectedPortIds.includes(port.id)}
                              onCheckedChange={() => handlePortToggle(port.id)}
                              disabled={!isOnline}
                            />
                            <div className="space-y-1 flex-1">
                              <Label 
                                htmlFor={`port-${port.id}`}
                                className="font-medium cursor-pointer"
                              >
                                Port {port.port_number}
                              </Label>
                              <div className="text-xs text-muted-foreground">
                                SIP: {port.sip_username}
                              </div>
                              <div className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {selectedPortIds.length === 0 && ports.length > 0 && (
                    <Alert variant="warning" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please select at least one port to use for this campaign.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Call Transfer: Using GoIP ports</p>
                  <p className="text-sm mt-1">
                    Your selected ports will be used to make outbound calls. When a call recipient presses "1", 
                    the same port will be used to create a second outbound call to your transfer number, and both 
                    calls will be bridged together.
                  </p>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
