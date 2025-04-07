
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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { HelpCircle, Save, Smartphone, RefreshCcw, PhoneCall, ChevronRight, WifiOff, Wifi, Upload, Server, Copy, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
import { generateRandomPassword } from '@/utils/passwordGenerator';

// Schema for the trunk name form
const trunkNameSchema = z.object({
  trunkName: z.string().min(3, "Trunk name must be at least 3 characters").max(50, "Trunk name must be at most 50 characters")
});

// Interface for the SIP credential
interface SipCredential {
  id: string;
  port_number: number;
  sip_user: string;
  sip_pass: string;
  trunk_name: string;
  status: string;
}

const GoipSetup = () => {
  const [credentials, setCredentials] = useState<SipCredential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyStatus, setCopyStatus] = useState<{[key: number]: boolean}>({});
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form for trunk name
  const form = useForm<z.infer<typeof trunkNameSchema>>({
    resolver: zodResolver(trunkNameSchema),
    defaultValues: {
      trunkName: "GoIP Trunk"
    }
  });

  // Fetch existing credentials when user loads the page
  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [user]);

  // Fetch existing credentials from Supabase
  const fetchCredentials = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', user.id)
        .order('port_number');
      
      if (error) throw error;
      
      setCredentials(data || []);
    } catch (error: any) {
      console.error('Error fetching credentials:', error);
      toast({
        title: "Error fetching credentials",
        description: error.message || "Could not fetch your credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate and save SIP credentials
  const generateCredentials = async (data: z.infer<typeof trunkNameSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to generate SIP credentials.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // First, delete any existing credentials for this user
      const { error: deleteError } = await supabase
        .from('user_trunks')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;
      
      // Generate new credentials for ports 1-4
      const newCredentials: Omit<SipCredential, 'id'>[] = [];
      
      for (let port = 1; port <= 4; port++) {
        const password = generateRandomPassword(10);
        newCredentials.push({
          port_number: port,
          sip_user: `user_${user.id.substring(0, 8)}_port${port}`,
          sip_pass: password,
          trunk_name: data.trunkName,
          status: 'active',
        });
      }
      
      // Insert all new credentials
      const { data: insertedData, error: insertError } = await supabase
        .from('user_trunks')
        .insert(newCredentials.map(cred => ({
          ...cred,
          user_id: user.id
        })))
        .select();
      
      if (insertError) throw insertError;
      
      setCredentials(insertedData || []);
      
      toast({
        title: "SIP credentials generated",
        description: "Your SIP credentials have been generated successfully.",
      });
    } catch (error: any) {
      console.error('Error generating credentials:', error);
      toast({
        title: "Error generating credentials",
        description: error.message || "Could not generate your credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy credentials to clipboard
  const copyToClipboard = (portNumber: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Set copy status for this specific port
      setCopyStatus(prev => ({ ...prev, [portNumber]: true }));
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [portNumber]: false }));
      }, 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "SIP credentials have been copied to your clipboard."
      });
    }).catch(err => {
      console.error('Copy failed:', err);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive"
      });
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 goip-header">
          <div>
            <h1 className="text-3xl font-bold">GoIP Setup</h1>
            <p className="text-muted-foreground">Connect your GoIP devices to our Asterisk server</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Badge 
              variant="outline" 
              className="bg-green-100 text-green-800 border-green-300 asterisk-status-badge"
            >
              <Server className="h-4 w-4 mr-1" />
              Asterisk Server: Connected
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* SIP Credentials Generator */}
          <Card className="goip-setup-container">
            <CardHeader>
              <CardTitle>Generate SIP Credentials</CardTitle>
              <CardDescription>
                Generate SIP credentials to connect your GoIP device to our Asterisk server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(generateCredentials)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="trunkName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trunk Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter a name for your SIP trunk" />
                        </FormControl>
                        <FormDescription>
                          This name will help you identify these credentials in your GoIP configuration.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Server className="h-4 w-4 mr-2" />
                          Generate SIP Credentials
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
              
              {/* SIP Credentials Table */}
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCcw className="h-8 w-8 mx-auto animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">Loading your SIP credentials...</p>
                </div>
              ) : credentials.length > 0 ? (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Your SIP Credentials</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Port Number</TableHead>
                          <TableHead>SIP Username</TableHead>
                          <TableHead>SIP Password</TableHead>
                          <TableHead>SIP Server</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {credentials.map((credential) => (
                          <TableRow key={credential.id}>
                            <TableCell>Port {credential.port_number}</TableCell>
                            <TableCell>{credential.sip_user}</TableCell>
                            <TableCell>{credential.sip_pass}</TableCell>
                            <TableCell>your-asterisk-ip</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(
                                  credential.port_number,
                                  `Server: your-asterisk-ip\nUsername: ${credential.sip_user}\nPassword: ${credential.sip_pass}`
                                )}
                              >
                                {copyStatus[credential.port_number] ? (
                                  <Check className="h-4 w-4 mr-1" />
                                ) : (
                                  <Copy className="h-4 w-4 mr-1" />
                                )}
                                Copy
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-md">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      GoIP Setup Instructions
                    </h4>
                    <p>
                      To set up your GoIP device, login to its web interface at http://192.168.8.1. For each port, enter the SIP Server: your-asterisk-ip, and use the username/password listed above. Then save and reboot your device.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed rounded-md mt-6">
                  <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No SIP credentials configured</p>
                  <p className="text-xs text-muted-foreground mb-4">Generate SIP credentials to connect your GoIP device to our Asterisk server</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Asterisk Integration Guide */}
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
                      <p className="text-sm text-muted-foreground">your-asterisk-ip</p>
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
                    <li>Generate your SIP credentials using the form above</li>
                    <li>Power on your GoIP device and connect it to your network</li>
                    <li>Access the GoIP web interface (default: http://192.168.8.1)</li>
                    <li>Navigate to the SIP configuration section</li>
                    <li>For each port, configure the SIP server, username and password from the table above</li>
                    <li>Save the configuration and reboot the device</li>
                    <li>The device should connect to our Asterisk server automatically</li>
                  </ol>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="font-medium mb-2">Troubleshooting:</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Connection Issues:</strong> Ensure your GoIP device is powered on and accessible on your network. Check that the SIP configuration is correct.</p>
                    <p><strong>Registration Problems:</strong> Verify that the username and password are entered correctly. The server value should be set to the IP address without any protocol prefix.</p>
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
