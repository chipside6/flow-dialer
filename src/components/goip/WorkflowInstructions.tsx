
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Cog, Network, PhoneCall, Server, Shield, ArrowRight } from 'lucide-react';
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
              <AlertTitle>Fully Automated Configuration</AlertTitle>
              <AlertDescription>
                Our system now automatically validates, configures and connects your GoIP device.
                Just provide your device's IP address and we handle everything else!
              </AlertDescription>
            </Alert>

            <h3 className="text-lg font-semibold">Automated Workflow</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Register your GoIP device (provide name, IP address, and number of ports)</li>
              <li>System automatically validates that your GoIP device is reachable</li>
              <li>SIP credentials are generated automatically for each port</li>
              <li>Configuration is applied to our Asterisk server</li>
              <li>Device is immediately ready to use for outbound campaigns</li>
            </ol>
            
            <div className="bg-slate-50 rounded-md p-4 mt-4 border">
              <h4 className="text-md font-semibold text-slate-700 mb-2">What happens behind the scenes:</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-1" />
                  <p className="text-sm">System checks if your GoIP device is online and reachable</p>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-1" />
                  <p className="text-sm">Secure SIP credentials are generated for each port</p>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-1" />
                  <p className="text-sm">Asterisk configuration is generated and applied</p>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-primary mt-1" />
                  <p className="text-sm">Device registration is stored securely in our database</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mt-4">Benefits</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>No manual SIP configuration required</li>
              <li>IP validation prevents setup errors</li>
              <li>Secure credential generation and storage</li>
              <li>Automatic Asterisk integration and configuration</li>
              <li>Ready for immediate campaign assignment</li>
              <li>Support for multiple ports per device</li>
            </ul>
          </TabsContent>
          
          <TabsContent value="technical" className="space-y-4">
            <h3 className="text-lg font-semibold">Backend Process</h3>
            <div className="space-y-3">
              <div className="border rounded-md p-3">
                <div className="font-semibold flex items-center gap-2">
                  <Server className="h-4 w-4" /> 1. Device Validation & Registration
                </div>
                <p className="text-sm text-muted-foreground">
                  When you register a device, our system first validates that the GoIP device is 
                  reachable at the specified IP address. Once validated, device details are 
                  securely stored in our database.
                </p>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" /> 2. SIP Configuration Generation
                </div>
                <p className="text-sm text-muted-foreground">
                  For each port on your GoIP device, our system generates a secure SIP configuration 
                  with unique credentials. This configuration follows best practices for security 
                  and reliability with your Asterisk server.
                </p>
                <div className="mt-2 bg-slate-50 p-2 rounded text-xs font-mono overflow-x-auto">
                  [goip-USER_ID-port1]<br/>
                  type=friend<br/>
                  host=192.168.1.100<br/>
                  port=5060<br/>
                  username=goip_user_port1<br/>
                  secret=********<br/>
                  context=from-goip<br/>
                  disallow=all<br/>
                  allow=ulaw<br/>
                  insecure=port,invite<br/>
                  nat=no<br/>
                  qualify=yes
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="font-semibold flex items-center gap-2">
                  <Network className="h-4 w-4" /> 3. Asterisk Integration
                </div>
                <p className="text-sm text-muted-foreground">
                  The system automatically applies the generated SIP configuration to the Asterisk 
                  server and reloads the SIP module to make the changes active immediately. Your 
                  device is now ready to make calls through our platform.
                </p>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mt-4">GoIP Device Requirements</h3>
            <div className="space-y-2">
              <p className="text-sm">For successful automatic configuration, ensure:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>GoIP device is powered on and connected to your network</li>
                <li>Device has a static IP or DHCP reservation (recommended)</li>
                <li>Network allows connections to the device on port 80 (for validation)</li>
                <li>SIP traffic (port 5060) can flow between the GoIP and our servers</li>
                <li>RTP ports (10000-20000) are open for voice traffic</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="troubleshooting" className="space-y-4">
            <h3 className="text-lg font-semibold">Common Issues</h3>
            
            <div className="space-y-3">
              <div className="border rounded-md p-3">
                <div className="font-semibold">Device Validation Fails</div>
                <p className="text-sm text-muted-foreground">
                  If the system cannot reach your GoIP device during registration:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Verify the IP address is correct</li>
                    <li>Ensure the device is powered on and connected to your network</li>
                    <li>Check that your network allows connections to the device on port 80</li>
                    <li>Try pinging the device from your computer to verify basic connectivity</li>
                  </ul>
                </p>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="font-semibold">Device Registers But Not Connected</div>
                <p className="text-sm text-muted-foreground">
                  If your device shows as registered but doesn't connect to our Asterisk server:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Verify your firewall allows SIP traffic (port 5060)</li>
                    <li>Check if your network uses NAT and may require additional configuration</li>
                    <li>Ensure RTP ports (10000-20000) are open for voice traffic</li>
                    <li>Check the device status in the dashboard to see if there are any reported errors</li>
                  </ul>
                </p>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="font-semibold">Poor Audio Quality</div>
                <p className="text-sm text-muted-foreground">
                  If calls connect but audio quality is poor:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Check your internet connection stability</li>
                    <li>Ensure your GoIP has adequate bandwidth (at least 100kbps per port)</li>
                    <li>Verify network QoS settings prioritize VoIP traffic</li>
                    <li>Update GoIP firmware to the latest version</li>
                  </ul>
                </p>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="font-semibold">IP Address Changes</div>
                <p className="text-sm text-muted-foreground">
                  If your GoIP device's IP address changes:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Re-register the device with the new IP address</li>
                    <li>Consider setting up a static IP or DHCP reservation to prevent future changes</li>
                    <li>Update any campaigns using the device to ensure continued operation</li>
                  </ul>
                </p>
              </div>
            </div>
            
            <Alert>
              <AlertTitle>Need Help?</AlertTitle>
              <AlertDescription>
                If you continue experiencing issues, please contact our support team with your device ID, 
                IP address, and specific error messages from the registration process or device logs.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
