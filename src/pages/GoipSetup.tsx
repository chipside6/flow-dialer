
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGoipSetup, SipUserCredential } from '@/hooks/useGoipSetup';
import { Copy, Loader2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useAuth } from '@/contexts/auth';

const GoipSetup = () => {
  const [trunkName, setTrunkName] = useState('');
  const { isSubmitting, credentials, createSipUsers, copyToClipboard } = useGoipSetup();
  const { isAuthenticated } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trunkName.trim()) return;
    
    await createSipUsers(trunkName.trim());
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">GoIP Setup</h1>
        
        {!isAuthenticated ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">You must be logged in to use this feature.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {credentials.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create GoIP Configuration</CardTitle>
                  <CardDescription>
                    Enter a name for your GoIP device to generate SIP credentials for all 4 ports.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="trunkName">GoIP Device Name</Label>
                      <Input
                        id="trunkName"
                        placeholder="e.g., Office GoIP, Home Device"
                        value={trunkName}
                        onChange={(e) => setTrunkName(e.target.value)}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        This name will help you identify this device in your account.
                      </p>
                    </div>
                    <Button type="submit" disabled={isSubmitting || !trunkName.trim()} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating credentials...
                        </>
                      ) : (
                        'Generate SIP Credentials'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>GoIP Credentials for "{credentials[0].trunk_name}"</CardTitle>
                    <CardDescription>
                      Here are the SIP credentials for your GoIP device's 4 ports. Save these credentials securely.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table className="min-w-full divide-y divide-gray-200">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px] py-4 pl-6">Port</TableHead>
                            <TableHead className="py-4 px-4">SIP Username</TableHead>
                            <TableHead className="py-4 px-4">SIP Password</TableHead>
                            <TableHead className="py-4 px-4 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {credentials.map((cred) => (
                            <TableRow key={cred.port_number}>
                              <TableCell className="py-4 pl-6 font-medium whitespace-nowrap">
                                Port {cred.port_number}
                              </TableCell>
                              <TableCell className="py-4 px-4 whitespace-nowrap">
                                <code className="bg-muted px-3 py-1.5 rounded text-sm break-all md:break-normal">
                                  {cred.sip_user}
                                </code>
                              </TableCell>
                              <TableCell className="py-4 px-4 whitespace-nowrap">
                                <code className="bg-muted px-3 py-1.5 rounded text-sm break-all md:break-normal">
                                  {cred.sip_pass}
                                </code>
                              </TableCell>
                              <TableCell className="py-4 px-4 text-right">
                                <div className="flex flex-wrap gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(cred.sip_user)}
                                    title="Copy username"
                                    className="h-9 whitespace-nowrap"
                                  >
                                    <Copy className="h-4 w-4 mr-1" /> Username
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(cred.sip_pass)}
                                    title="Copy password"
                                    className="h-9 whitespace-nowrap"
                                  >
                                    <Copy className="h-4 w-4 mr-1" /> Password
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration Instructions</CardTitle>
                    <CardDescription>
                      Follow these steps to configure your GoIP device
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-medium mb-2">1. Access Your GoIP Admin Panel</h3>
                        <p>Login to your GoIP device admin panel using the device's IP address.</p>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-medium mb-2">2. Navigate to SIP Settings</h3>
                        <p>Find the SIP configuration section in your GoIP admin panel.</p>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-medium mb-2">3. Configure Each Port</h3>
                        <p>For each port (1-4), enter the corresponding SIP username and password from the table above.</p>
                        <p className="mt-2">Make sure to set the following parameters:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>SIP Server: <code className="bg-muted px-2 py-1 rounded">grhvoclalziyjbjlhpml.supabase.co</code></li>
                          <li>SIP Port: <code className="bg-muted px-2 py-1 rounded">5060</code></li>
                          <li>Registration Interval: <code className="bg-muted px-2 py-1 rounded">60</code> (seconds)</li>
                        </ul>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-medium mb-2">4. Save and Restart</h3>
                        <p>Save your settings and restart the GoIP device to apply the new configuration.</p>
                      </div>
                      
                      <Button onClick={() => createSipUsers('')} variant="outline">
                        Create New GoIP Configuration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GoipSetup;
