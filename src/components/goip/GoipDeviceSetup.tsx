import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Check, Copy, Server } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GoipDeviceInstructions } from './GoipDeviceInstructions';
import { useLoadingStateManager } from '@/hooks/useLoadingStateManager';
import { LoadingState } from '@/components/upgrade/LoadingState';

// Define the form schema
const formSchema = z.object({
  deviceName: z.string().min(3, { message: 'Device name must be at least 3 characters' }),
  deviceIp: z.string().ip({ message: 'Please enter a valid IP address' }).or(z.string().regex(/^[\w.-]+\.[\w.-]+/, { message: 'Please enter a valid hostname or IP address' })),
  numPorts: z.coerce.number().min(1).max(8)
});

export function GoipDeviceSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [copiedPort, setCopiedPort] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('register');
  
  const { isLoading, setIsLoading } = useLoadingStateManager({
    initialState: false,
    timeout: 15000,
    onTimeout: () => {
      toast({
        title: "Operation timed out",
        description: "Device registration is taking longer than expected. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: '',
      deviceIp: '',
      numPorts: 4
    }
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to register devices",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate random passwords and create configurations
      const ports = [];
      const configs = [];
      
      for (let port = 1; port <= values.numPorts; port++) {
        const password = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        
        ports.push({
          port_number: port,
          sip_user: `goip_${user.id.substring(0, 8)}_port${port}`,
          sip_pass: password,
          trunk_name: values.deviceName,
          status: 'active',
          device_ip: values.deviceIp
        });
        
        configs.push(`
[${values.deviceName}_port${port}]
type=peer
host=${values.deviceIp}
port=5060
username=goip_${user.id.substring(0, 8)}_port${port}
secret=${password}
fromuser=goip_${user.id.substring(0, 8)}_port${port}
context=from-goip
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no
rtp_timeout=30
transport=udp
        `);
      }
      
      // First, delete any existing credentials for this device name
      const { error: deleteError } = await supabase
        .from('user_trunks')
        .delete()
        .eq('user_id', user.id)
        .eq('trunk_name', values.deviceName);
      
      if (deleteError) throw deleteError;
      
      // Insert all new credentials
      const { data: insertedData, error: insertError } = await supabase
        .from('user_trunks')
        .insert(ports.map(port => ({
          ...port,
          user_id: user.id
        })))
        .select();
      
      if (insertError) throw insertError;
      
      // Save the configuration to Asterisk configs table
      const { error: configError } = await supabase
        .from('asterisk_configs')
        .insert({
          user_id: user.id,
          config_name: `goip_device_${values.deviceName}`,
          config_type: 'sip',
          config_content: configs.join('\n'),
          active: true
        });
      
      if (configError) throw configError;
      
      // Sync the configuration with Asterisk
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      if (accessToken) {
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-goip-config`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              userId: user.id,
              operation: 'sync_user'
            })
          });
        } catch (syncError) {
          console.error('Error syncing with Asterisk:', syncError);
          // Don't fail the main operation if this secondary task fails
        }
      }
      
      // Store the configuration data for display
      setRegistrationData({
        deviceName: values.deviceName,
        deviceIp: values.deviceIp,
        ports: ports,
        serverIp: import.meta.env.VITE_ASTERISK_SERVER_IP || 'your-asterisk-server-ip'
      });
      
      // Show success message
      toast({
        title: "Device registered successfully",
        description: `${values.deviceName} with ${values.numPorts} ports has been registered.`,
      });
      
      // Switch to credentials tab
      setActiveTab('credentials');
    } catch (error: any) {
      console.error('Error registering device:', error);
      toast({
        title: "Error registering device",
        description: error.message || "Could not register your device. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const copyToClipboard = (text: string, portNumber: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPort(portNumber);
      setTimeout(() => setCopiedPort(null), 2000);
    });
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>GoIP Device Setup</CardTitle>
        <CardDescription>
          Register your GoIP device to use with the autodialer system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="register">Register Device</TabsTrigger>
            <TabsTrigger value="credentials" disabled={!registrationData}>Credentials</TabsTrigger>
            <TabsTrigger value="instructions">Setup Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register">
            {isLoading ? (
              <LoadingState 
                message="Registering your device..." 
                timeout={10000}
              />
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="deviceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My GoIP 8" {...field} />
                        </FormControl>
                        <FormDescription>
                          A friendly name to identify your GoIP device
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deviceIp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device IP Address</FormLabel>
                        <FormControl>
                          <Input placeholder="192.168.1.100" {...field} />
                        </FormControl>
                        <FormDescription>
                          Public IP address or hostname of your GoIP device
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="numPorts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Ports</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select number of ports" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 4, 8].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Port' : 'Ports'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How many ports does your GoIP device have?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register Device'}
                  </Button>
                </form>
              </Form>
            )}
          </TabsContent>
          
          <TabsContent value="credentials">
            {registrationData && (
              <div className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Save these credentials immediately. For security, the passwords will not be shown again.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Device: {registrationData.deviceName}</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left">Port</th>
                          <th className="px-4 py-2 text-left">SIP Username</th>
                          <th className="px-4 py-2 text-left">SIP Password</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrationData.ports.map((port: any) => (
                          <tr key={port.port_number} className="border-b">
                            <td className="px-4 py-2">Port {port.port_number}</td>
                            <td className="px-4 py-2 font-mono text-sm">{port.sip_user}</td>
                            <td className="px-4 py-2 font-mono text-sm">{port.sip_pass}</td>
                            <td className="px-4 py-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => copyToClipboard(`Server: ${registrationData.serverIp}\nPort: 5060\nUsername: ${port.sip_user}\nPassword: ${port.sip_pass}`, port.port_number)}
                              >
                                {copiedPort === port.port_number ? (
                                  <Check className="h-4 w-4 mr-2" />
                                ) : (
                                  <Copy className="h-4 w-4 mr-2" />
                                )}
                                {copiedPort === port.port_number ? 'Copied!' : 'Copy'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Button onClick={() => setActiveTab('instructions')}>
                  <Server className="h-4 w-4 mr-2" />
                  View Setup Instructions
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="instructions">
            <GoipDeviceInstructions />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
