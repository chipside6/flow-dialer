
import React from 'react';
import { Server, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ASTERISK_CONFIG } from '@/config/productionConfig';

export const AsteriskGuide = () => {
  const asteriskIp = ASTERISK_CONFIG.apiUrl.split(':')[0]; // Extract just the IP part
  
  return (
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
                <p className="text-sm text-muted-foreground">{asteriskIp}</p>
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
  );
};
