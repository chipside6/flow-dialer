
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
import { HelpCircle, Save, Smartphone, RefreshCcw, PhoneCall, ChevronRight, WifiOff, Wifi, Upload, Server } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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

// Schema for GoIP device validation
const goipDeviceSchema = z.object({
  name: z.string().min(1, "Device name is required"),
  ip: z.string().min(1, "IP address is required").regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Valid IP address is required"),
  port: z.coerce.number().int().min(1, "Port must be at least 1").max(65535, "Port must be at most 65535"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  channels: z.coerce.number().int().min(1, "Channels must be at least 1")
});

const GoipSetup = () => {
  const [devices, setDevices] = useState<GoIPDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<GoIPDevice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [asteriskConnected, setAsteriskConnected] = useState(false);
  const { toast } = useToast();

  // Form for device editing
  const form = useForm<z.infer<typeof goipDeviceSchema>>({
    resolver: zodResolver(goipDeviceSchema),
    defaultValues: {
      name: "",
      ip: "",
      port: 80,
      username: "admin",
      password: "",
      channels: 8
    }
  });

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

    // Simulate checking Asterisk connection
    const timer = setTimeout(() => {
      setAsteriskConnected(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      form.reset({
        name: selectedDevice.name,
        ip: selectedDevice.ip,
        port: selectedDevice.port,
        username: selectedDevice.username,
        password: selectedDevice.password === '•••••••' ? '' : selectedDevice.password,
        channels: selectedDevice.channels
      });
    }
  }, [selectedDevice, form]);

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

  const handleSaveDevice = (data: z.infer<typeof goipDeviceSchema>) => {
    if (!selectedDevice) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      const updatedDevice = {
        ...selectedDevice,
        name: data.name,
        ip: data.ip,
        port: data.port,
        username: data.username,
        password: data.password || '•••••••',
        channels: data.channels
      };
      
      setDevices(devices.map(d => 
        d.id === selectedDevice.id ? updatedDevice : d
      ));
      
      setSelectedDevice(updatedDevice);
      
      toast({
        title: "Settings saved",
        description: `Settings for ${updatedDevice.name} have been updated.`,
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

  const handleConnectToAsterisk = () => {
    if (!selectedDevice) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Device connected to Asterisk",
        description: `${selectedDevice.name} has been registered with the Asterisk server.`,
      });

      // Update the device status to online
      setDevices(devices.map(d => 
        d.id === selectedDevice.id ? {...d, status: 'online', lastSeen: 'just now'} : d
      ));
    }, 1500);
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

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">GoIP Setup</h1>
            <p className="text-muted-foreground">Connect your GoIP devices to our Asterisk server</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshStatus}
              disabled={refreshing}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
            <Badge 
              variant={asteriskConnected ? "outline" : "destructive"} 
              className={asteriskConnected ? "bg-green-100 text-green-800 border-green-300" : ""}
            >
              <Server className="h-4 w-4 mr-1" />
              Asterisk Server: {asteriskConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Device List */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Your GoIP Devices</span>
                  <Button size="sm" onClick={handleAddDevice}>Add Device</Button>
                </CardTitle>
                <CardDescription>Connect your GoIP hardware devices</CardDescription>
              </CardHeader>
              <CardContent>
                {devices.length === 0 ? (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No devices configured</p>
                    <p className="text-xs text-muted-foreground mb-4">Add your GoIP device to connect it to our Asterisk server</p>
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
                  <CardDescription>Configure your GoIP device to connect with our Asterisk server</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="general">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="general">General</TabsTrigger>
                      <TabsTrigger value="network">Network</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSaveDevice)}>
                        <TabsContent value="general" className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Device Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="channels"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Channels</FormLabel>
                                  <FormControl>
                                    <Select 
                                      value={field.value.toString()}
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                    >
                                      <SelectTrigger>
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
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
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

                          <div className="mt-4">
                            <Button 
                              type="button"
                              variant="outline" 
                              className="w-full"
                              onClick={handleConnectToAsterisk}
                            >
                              <Server className="h-4 w-4 mr-2" />
                              Connect to Asterisk Server
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="network" className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="ip"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>IP Address</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="port"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Port</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} placeholder="••••••••" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-4 flex items-center justify-end">
                            <Button 
                              type="button"
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
                          
                          <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
                            <h3 className="font-medium text-amber-800 flex items-center">
                              <Upload className="h-4 w-4 mr-2" />
                              Asterisk Configuration
                            </h3>
                            <p className="text-sm text-amber-700 mt-1 mb-3">
                              Upload the generated Asterisk configuration for this device to connect it to your server.
                            </p>
                            <Button 
                              type="button"
                              variant="outline" 
                              className="w-full bg-white"
                            >
                              Generate Asterisk Config
                            </Button>
                          </div>
                          
                          <div className="mt-4">
                            <Button 
                              type="button"
                              variant="destructive" 
                              onClick={handleDeleteDevice}
                              className="w-full"
                            >
                              Remove Device
                            </Button>
                          </div>
                        </TabsContent>

                        <div className="mt-6 flex justify-between">
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => setSelectedDevice(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isLoading}
                          >
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
                        </div>
                      </form>
                    </Form>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                  <Smartphone className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Device Selected</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Select a device from the list or add a new GoIP device to configure it for connection with our Asterisk server.
                  </p>
                  <div className="space-y-2 w-full max-w-xs">
                    <Button onClick={handleAddDevice} className="w-full">
                      Add GoIP Device
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Asterisk Setup Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Asterisk Integration Guide</CardTitle>
              <CardDescription>Learn how to connect your GoIP devices to our Asterisk server</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Server className="h-4 w-4 mr-2" />
                    Our Asterisk Server Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Server Address:</p>
                      <p className="text-sm text-muted-foreground">asterisk.example.com</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Port:</p>
                      <p className="text-sm text-muted-foreground">5060</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Registration Required:</p>
                      <p className="text-sm text-muted-foreground">Yes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Authentication Method:</p>
                      <p className="text-sm text-muted-foreground">Digest</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Steps to Connect:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
                    <li>Add your GoIP device using the form above</li>
                    <li>Ensure your device is accessible on your network</li>
                    <li>Configure network settings with correct IP and port</li>
                    <li>Click "Connect to Asterisk Server" to register your device</li>
                    <li>Test your connection using the "Test Connection" button</li>
                    <li>Generate and download Asterisk configuration if needed</li>
                  </ol>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="font-medium mb-2">Troubleshooting:</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Connection Issues:</strong> Ensure your GoIP device is powered on and accessible on your network. Check that the IP address and port are correctly configured.</p>
                    <p><strong>Registration Problems:</strong> Verify that the username and password match your account. If you've recently changed credentials, update them here.</p>
                    <p><strong>Call Quality Issues:</strong> Make sure your network has sufficient bandwidth and low latency for VoIP traffic.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">For additional support, please contact our technical team at support@example.com</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GoipSetup;
