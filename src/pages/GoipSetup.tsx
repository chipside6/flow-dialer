
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { HelpCircle, Save, Smartphone, RefreshCcw, PhoneCall, ChevronRight, WifiOff, Wifi } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Interface for GoIP device
interface GoIPDevice {
  id: number;
  name: string;
  ip: string;
  port: number;
  username: string;
  password: string;
  channels: number;
  status: 'online' | 'offline' | 'unknown';
  lastSeen: string;
  firmware: string;
}

const GoipSetup = () => {
  const [devices, setDevices] = useState<GoIPDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<GoIPDevice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Sample data - in a real app, this would come from an API
  useEffect(() => {
    const sampleDevices: GoIPDevice[] = [
      {
        id: 1,
        name: 'GoIP-8-1',
        ip: '192.168.1.100',
        port: 80,
        username: 'admin',
        password: '•••••••',
        channels: 8,
        status: 'online',
        lastSeen: '2 minutes ago',
        firmware: 'v1.9.8'
      },
      {
        id: 2,
        name: 'GoIP-4-Office',
        ip: '192.168.1.101',
        port: 8080,
        username: 'admin',
        password: '•••••••',
        channels: 4,
        status: 'offline',
        lastSeen: '2 days ago',
        firmware: 'v1.9.7'
      },
      {
        id: 3,
        name: 'GoIP-16-MainLine',
        ip: '192.168.1.102',
        port: 80,
        username: 'admin',
        password: '•••••••',
        channels: 16,
        status: 'online',
        lastSeen: 'just now',
        firmware: 'v2.0.1'
      }
    ];
    setDevices(sampleDevices);
  }, []);

  const handleAddDevice = () => {
    const newDevice: GoIPDevice = {
      id: devices.length + 1,
      name: 'New Device',
      ip: '192.168.1.1',
      port: 80,
      username: 'admin',
      password: 'password',
      channels: 8,
      status: 'unknown',
      lastSeen: 'never',
      firmware: 'unknown'
    };
    
    setDevices([...devices, newDevice]);
    setSelectedDevice(newDevice);
    
    toast({
      title: "Device added",
      description: "New GoIP device has been added. Please configure it.",
    });
  };

  const handleSaveDevice = () => {
    if (!selectedDevice) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      setDevices(devices.map(d => 
        d.id === selectedDevice.id ? selectedDevice : d
      ));
      
      toast({
        title: "Settings saved",
        description: `Settings for ${selectedDevice.name} have been updated.`,
      });
    }, 1000);
  };

  const handleDeleteDevice = () => {
    if (!selectedDevice) return;
    
    setDevices(devices.filter(d => d.id !== selectedDevice.id));
    setSelectedDevice(null);
    
    toast({
      title: "Device removed",
      description: `${selectedDevice.name} has been removed.`,
    });
  };

  const handleRefreshStatus = () => {
    setRefreshing(true);
    
    setTimeout(() => {
      setRefreshing(false);
      
      toast({
        title: "Status refreshed",
        description: "All device statuses have been updated.",
      });
      
      // Update statuses randomly for demo purposes
      setDevices(devices.map(d => ({
        ...d,
        status: Math.random() > 0.3 ? 'online' : 'offline',
        lastSeen: 'just now'
      })));
    }, 2000);
  };

  const handleUpdateFirmware = () => {
    if (!selectedDevice) return;
    
    toast({
      title: "Firmware update",
      description: "Firmware update feature is coming soon.",
    });
  };

  const handleTestDevice = () => {
    if (!selectedDevice) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      const success = Math.random() > 0.2;
      
      toast({
        title: success ? "Connection successful" : "Connection failed",
        description: success 
          ? `Successfully connected to ${selectedDevice.name}.` 
          : `Failed to connect to ${selectedDevice.name}. Please check your settings.`,
        variant: success ? "default" : "destructive",
      });
    }, 1500);
  };

  const updateDeviceField = (field: keyof GoIPDevice, value: string | number) => {
    if (!selectedDevice) return;
    setSelectedDevice({
      ...selectedDevice,
      [field]: value
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">GoIP Setup</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshStatus}
            disabled={refreshing}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Device List */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Devices</span>
                  <Button size="sm" onClick={handleAddDevice}>Add Device</Button>
                </CardTitle>
                <CardDescription>GoIP hardware devices</CardDescription>
              </CardHeader>
              <CardContent>
                {devices.length === 0 ? (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No devices configured</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleAddDevice}
                    >
                      Add Your First Device
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {devices.map(device => (
                      <div 
                        key={device.id}
                        className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors ${selectedDevice?.id === device.id ? 'bg-muted border-primary' : ''}`}
                        onClick={() => setSelectedDevice(device)}
                      >
                        <div className="flex items-center space-x-3">
                          <Smartphone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{device.name}</p>
                            <p className="text-xs text-muted-foreground">{device.ip}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {device.status === 'online' ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              <Wifi className="h-3 w-3 mr-1" />
                              Online
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                              <WifiOff className="h-3 w-3 mr-1" />
                              Offline
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Device Details */}
          <div className="md:col-span-2">
            {selectedDevice ? (
              <Card>
                <CardHeader>
                  <CardTitle>Device Configuration</CardTitle>
                  <CardDescription>Configure your GoIP device settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="general">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="network">Network</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="device-name">Device Name</Label>
                          <Input 
                            id="device-name" 
                            value={selectedDevice.name} 
                            onChange={(e) => updateDeviceField('name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="device-channels">Channels</Label>
                          <Select 
                            value={selectedDevice.channels.toString()}
                            onValueChange={(value) => updateDeviceField('channels', parseInt(value))}
                          >
                            <SelectTrigger id="device-channels">
                              <SelectValue placeholder="Select channels" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Channel</SelectItem>
                              <SelectItem value="4">4 Channels</SelectItem>
                              <SelectItem value="8">8 Channels</SelectItem>
                              <SelectItem value="16">16 Channels</SelectItem>
                              <SelectItem value="32">32 Channels</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch 
                          id="auto-detection" 
                          defaultChecked 
                        />
                        <Label htmlFor="auto-detection">Enable auto-detection</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div>
                              <h4 className="font-medium leading-none mb-2">Auto-detection</h4>
                              <p className="text-sm text-muted-foreground">When enabled, the system will scan your network to detect GoIP devices automatically.</p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm mt-4">
                        <p><strong>Status:</strong> {selectedDevice.status === 'online' ? 'Online' : 'Offline'}</p>
                        <p><strong>Last seen:</strong> {selectedDevice.lastSeen}</p>
                        <p><strong>Firmware:</strong> {selectedDevice.firmware}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="network" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ip-address">IP Address</Label>
                          <Input 
                            id="ip-address" 
                            value={selectedDevice.ip} 
                            onChange={(e) => updateDeviceField('ip', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="port">Port</Label>
                          <Input 
                            id="port" 
                            type="number" 
                            value={selectedDevice.port} 
                            onChange={(e) => updateDeviceField('port', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value={selectedDevice.username} 
                            onChange={(e) => updateDeviceField('username', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            value={selectedDevice.password} 
                            onChange={(e) => updateDeviceField('password', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mr-2"
                          onClick={handleTestDevice}
                          disabled={isLoading}
                        >
                          <PhoneCall className="h-4 w-4 mr-2" />
                          Test Connection
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="sip-registration" defaultChecked />
                          <Label htmlFor="sip-registration">Auto SIP Registration</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="call-forwarding" />
                          <Label htmlFor="call-forwarding">Call Forwarding</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="ussd-support" defaultChecked />
                          <Label htmlFor="ussd-support">USSD Support</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="sms-gateway" defaultChecked />
                          <Label htmlFor="sms-gateway">SMS Gateway</Label>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="mb-4">
                        <Button 
                          variant="outline" 
                          onClick={handleUpdateFirmware}
                          className="w-full"
                        >
                          Update Firmware
                        </Button>
                      </div>
                      
                      <div className="mb-4">
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteDevice}
                          className="w-full"
                        >
                          Remove Device
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setSelectedDevice(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDevice} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                  <Smartphone className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Device Selected</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Select a device from the list or add a new GoIP device to configure it.
                  </p>
                  <Button onClick={handleAddDevice}>
                    Add GoIP Device
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GoipSetup;
