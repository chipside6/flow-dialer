
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Cog, Network, PhoneCall, Server, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const WorkflowInstructions: React.FC = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cog className="h-5 w-5 text-primary" />
          GoIP Device Integration Workflow
        </CardTitle>
        <CardDescription>
          Complete guide for connecting your GoIP device with our Asterisk server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="technical">Technical Setup</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Automatic Configuration</AlertTitle>
              <AlertDescription>
                Our system now automatically generates SIP credentials when you register a device.
                This eliminates manual configuration on your GoIP device.
              </AlertDescription>
            </Alert>

            <h3 className="text-lg font-semibold">Workflow Steps</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Register your GoIP device through our platform</li>
              <li>System automatically generates SIP credentials for each port</li>
              <li>Configure your GoIP device network settings using the generated credentials</li>
              <li>System connects your device to our Asterisk server</li>
              <li>Device ready to use for outbound campaigns</li>
            </ol>
            
            <h3 className="text-lg font-semibold mt-4">Benefits</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>No manual SIP configuration required</li>
              <li>Secure credential generation</li>
              <li>Automatic Asterisk integration</li>
              <li>Ready for immediate campaign assignment</li>
            </ul>
          </TabsContent>
          
          <TabsContent value="technical" className="space-y-4">
            <h3 className="text-lg font-semibold">Backend Process</h3>
            <div className="space-y-3">
              <div className="border rounded-md p-3">
                <div className="font-semibold flex items-center gap-2">
                  <Server className="h-4 w-4" /> 1. Device Registration
                </div>
                <p className="text-sm text-muted-foreground">
                  When you register a device, our system stores the device details in the database and 
                  generates unique SIP credentials for each port.
                </p>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" /> 2. Secure Credential Generation
                </div>
                <p className="text-sm text-muted-foreground">
                  For each port, a secure username and password are automatically generated and stored.
                  These credentials are then linked to your user account and specific device.
                </p>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="font-semibold flex items-center gap-2">
                  <Network className="h-4 w-4" /> 3. Asterisk Configuration
                </div>
                <p className="text-sm text-muted-foreground">
                  Our system automatically generates the necessary Asterisk SIP configurations and 
                  dialplan entries for your device, then syncs them with our Asterisk server.
                </p>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mt-4">GoIP Device Setup</h3>
            <div className="space-y-2">
              <p className="text-sm">Configure your GoIP device with these settings:</p>
              <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto">
                <p>SIP Server: {process.env.ASTERISK_SERVER_IP || 'your-asterisk-server.com'}</p>
                <p>SIP Port: 5060</p>
                <p>Username: [auto-generated username shown in dashboard]</p>
                <p>Password: [auto-generated password shown in dashboard]</p>
                <p>Authentication: Yes</p>
                <p>Registration Period: 120 seconds</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="troubleshooting" className="space-y-4">
            <h3 className="text-lg font-semibold">Common Issues</h3>
            
            <div className="space-y-3">
              <div className="border rounded-md p-3">
                <div className="font-semibold">Device Not Registering</div>
                <p className="text-sm text-muted-foreground">
                  Check network connectivity, verify SIP credentials match exactly what's shown in dashboard,
                  ensure no firewalls are blocking SIP traffic (port 5060).
                </p>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="font-semibold">Calls Not Connecting</div>
                <p className="text-sm text-muted-foreground">
                  Verify your GoIP device is showing as online in our dashboard, check call logs in your 
                  GoIP device admin panel, ensure the called number is in the correct format.
                </p>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="font-semibold">Poor Audio Quality</div>
                <p className="text-sm text-muted-foreground">
                  Check your internet connection stability, reduce network congestion, verify 
                  GoIP firmware is updated to the latest version.
                </p>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="font-semibold">Dialplan Issues</div>
                <p className="text-sm text-muted-foreground">
                  If calls connect but transfers fail, check the transfer settings in your campaign.
                  If a call is connected but no audio, check if the call status variable is correctly set.
                  If the campaign doesn't detect key presses, verify the DTMF settings.
                </p>
              </div>
            </div>
            
            <Alert>
              <AlertTitle>Need Help?</AlertTitle>
              <AlertDescription>
                If you continue experiencing issues, please contact our support team with your device ID and 
                specific error messages from the GoIP device logs.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
