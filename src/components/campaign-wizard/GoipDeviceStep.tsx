import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';

interface Port {
  id: string;
  port_number: number;
  status: string;
}

interface Device {
  id: string;
  device_name: string;
  ip_address: string;
  ports?: Port[];
}

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
  const [devices, setDevices] = useState<Device[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch devices on component mount
  useEffect(() => {
    if (user) {
      fetchGoipDevices();
    }
  }, [user]);

  // Fetch ports when device is selected
  useEffect(() => {
    if (selectedDeviceId) {
      fetchDevicePorts(selectedDeviceId);
    } else {
      setPorts([]);
    }
  }, [selectedDeviceId]);

  const fetchGoipDevices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('goip_devices')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setDevices(data || []);
      
      // If no device is selected but we have devices, select the first one
      if (!selectedDeviceId && data && data.length > 0) {
        onDeviceChange(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching GoIP devices:', err);
      setError('Failed to load your GoIP devices');
      toast({
        title: 'Error',
        description: 'Failed to load GoIP devices. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDevicePorts = async (deviceId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('goip_ports')
        .select('*')
        .eq('device_id', deviceId)
        .order('port_number', { ascending: true });
      
      if (error) throw error;
      
      setPorts(data || []);
      
      // Reset selected ports when device changes
      if (selectedDeviceId !== deviceId) {
        onPortsChange([]);
      }
    } catch (err) {
      console.error('Error fetching device ports:', err);
      setPorts([]);
      toast({
        title: 'Error',
        description: 'Failed to load device ports. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceChange = (value: string) => {
    onDeviceChange(value);
  };

  const handlePortToggle = (portId: string) => {
    const updatedPorts = selectedPortIds.includes(portId)
      ? selectedPortIds.filter(id => id !== portId)
      : [...selectedPortIds, portId];
    
    onPortsChange(updatedPorts);
  };

  const handleSelectAllPorts = () => {
    const availablePorts = ports
      .filter(port => port.status === 'available')
      .map(port => port.id);
    
    onPortsChange(availablePorts);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Available</Badge>;
      case 'busy':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Busy</Badge>;
      case 'offline':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (devices.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No GoIP Devices Found</CardTitle>
          <CardDescription>
            You need to add at least one GoIP device before creating a campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please go to the GoIP Setup page to add your devices first.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.href = '/goip-setup'}>
            Go to GoIP Setup
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="goip-device">Select GoIP Device</Label>
        <Select
          value={selectedDeviceId}
          onValueChange={handleDeviceChange}
          disabled={isLoading || devices.length === 0}
        >
          <SelectTrigger id="goip-device">
            <SelectValue placeholder={isLoading ? "Loading devices..." : "Select a GoIP device"} />
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Select Available Ports</Label>
            {ports.filter(port => port.status === 'available').length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAllPorts}
              >
                Select All Available
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : ports.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No ports found for this device. Please check your device configuration.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ports.map(port => (
                <div 
                  key={port.id}
                  className={`
                    p-3 border rounded-md flex flex-col items-center space-y-2
                    ${port.status === 'available' ? 'bg-background' : 'bg-muted opacity-60'}
                    ${selectedPortIds.includes(port.id) ? 'border-primary' : 'border-border'}
                  `}
                >
                  <span className="text-sm font-medium">Port {port.port_number}</span>
                  {getStatusBadge(port.status)}
                  <div className="pt-1">
                    <Checkbox
                      checked={selectedPortIds.includes(port.id)}
                      onCheckedChange={() => handlePortToggle(port.id)}
                      disabled={port.status !== 'available'}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {ports.length > 0 && selectedPortIds.length === 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select at least one port to proceed.
              </AlertDescription>
            </Alert>
          )}
          
          {selectedPortIds.length > 0 && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {selectedPortIds.length} port{selectedPortIds.length > 1 ? 's' : ''} selected.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};
