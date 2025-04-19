
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { goipService } from '@/utils/asterisk/services/goipService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingErrorBoundary } from '@/components/common/LoadingErrorBoundary';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, ChevronDown, ChevronUp, Loader2, RefreshCw, Server, Check, X, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PortDetailModal } from './PortDetailModal';

interface RegisteredDevicesListProps {
  refreshTrigger?: number;
}

export const RegisteredDevicesList: React.FC<RegisteredDevicesListProps> = ({ refreshTrigger = 0 }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [expandedDevices, setExpandedDevices] = useState<Record<string, boolean>>({});
  const [selectedPort, setSelectedPort] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDevices = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await goipService.getUserDevices(user.id);
      
      if (result.success && result.devices) {
        setDevices(result.devices);
      } else {
        throw new Error(result.message || 'Failed to load devices');
      }
    } catch (err: any) {
      console.error('Error fetching devices:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDevices();
  }, [user?.id, refreshTrigger]);
  
  const handleRefresh = () => {
    fetchDevices();
  };
  
  const toggleDeviceExpansion = (deviceId: string) => {
    setExpandedDevices(prev => ({
      ...prev,
      [deviceId]: !prev[deviceId]
    }));
  };
  
  const openPortDetails = (port: any) => {
    setSelectedPort(port);
    setIsModalOpen(true);
  };
  
  const regenerateCredentials = async (portId: string) => {
    if (!user?.id) return;
    
    try {
      const result = await goipService.regenerateCredentials(user.id, portId);
      
      if (result.success) {
        toast({
          title: "Credentials regenerated",
          description: "New SIP credentials have been generated for this port",
        });
        // Refresh the device list to show updated credentials
        fetchDevices();
      } else {
        toast({
          title: "Error regenerating credentials",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error('Error regenerating credentials:', err);
      toast({
        title: "Error regenerating credentials",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">
            <Wifi className="h-3 w-3 mr-1" />
            Online
          </Badge>
        );
      case 'busy':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            In Call
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300">
            Unknown
          </Badge>
        );
    }
  };
  
  const handleRetry = () => {
    fetchDevices();
  };
  
  return (
    <LoadingErrorBoundary
      isLoading={isLoading}
      error={error}
      onRetry={handleRetry}
      loadingComponent={
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Loading your devices...</p>
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Your Registered Devices
            </CardTitle>
            <CardDescription>
              Manage your GoIP devices and port configurations
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-6">
              <Server className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
              <h3 className="font-medium text-lg">No devices registered</h3>
              <p className="text-muted-foreground mb-4">
                You haven't registered any GoIP devices yet
              </p>
              <Button variant="outline" onClick={() => document.querySelector('[data-value="register"]')?.click()}>
                Register Your First Device
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.device_name} className="border rounded-lg overflow-hidden">
                  <div 
                    className="p-4 bg-muted/30 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleDeviceExpansion(device.device_name)}
                  >
                    <div>
                      <h3 className="font-medium text-lg">{device.device_name}</h3>
                      <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                        <span>{device.device_ip}</span>
                        <span>•</span>
                        <span>{device.ports.length} Ports</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(device.ports[0]?.status || 'unknown')}
                      {expandedDevices[device.device_name] ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  
                  <Collapsible open={expandedDevices[device.device_name]}>
                    <CollapsibleContent>
                      <div className="p-4">
                        <h4 className="font-medium mb-2">Port Configuration</h4>
                        <Table className="goip-table">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Port</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>SIP Username</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {device.ports.map((port: any) => (
                              <TableRow key={port.port_number}>
                                <TableCell className="font-medium">Port {port.port_number}</TableCell>
                                <TableCell>{getStatusBadge(port.status)}</TableCell>
                                <TableCell className="font-mono text-xs">{port.sip_user}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openPortDetails(port)}
                                    >
                                      Details
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => regenerateCredentials(port.id || '')}
                                    >
                                      Regen Creds
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedPort && (
        <PortDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          port={selectedPort}
          deviceIp={devices.find(d => d.ports.some((p: any) => p.port_number === selectedPort.port_number))?.device_ip}
          onRegenerateCredentials={() => selectedPort.id && regenerateCredentials(selectedPort.id)}
        />
      )}
    </LoadingErrorBoundary>
  );
};
