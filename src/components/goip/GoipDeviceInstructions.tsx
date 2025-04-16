
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Info, Smartphone, Server, Globe } from "lucide-react";

export const GoipDeviceInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          GoIP Device Configuration Guide
        </CardTitle>
        <CardDescription>
          Step-by-step instructions for setting up your GoIP device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Requirements</AlertTitle>
          <AlertDescription>
            You'll need direct access to your GoIP device's web interface (usually via its IP address).
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Step 1: Access Your GoIP Device
          </h3>
          <p className="text-sm text-muted-foreground">
            Open a web browser and navigate to your GoIP device's IP address (for example, http://192.168.1.100)
          </p>
          <p className="text-sm text-muted-foreground">
            Login with your admin credentials (default is often admin/admin)
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Server className="h-5 w-5" />
            Step 2: Configure SIP Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Navigate to the "VoIP" or "SIP Settings" section in the menu
          </p>
          <p className="text-sm text-muted-foreground">
            For each port, enter the following information:
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Phone Number/SIP Username: (use the username provided in the credentials section)</li>
            <li>Authentication ID: (use the same username)</li>
            <li>Password: (use the password provided in the credentials section)</li>
            <li>SIP Proxy/Server: (use our Asterisk server IP address)</li>
            <li>SIP Port: 5060 (standard SIP port)</li>
            <li>Registration Interval: 600 seconds</li>
          </ul>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Step 3: General Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Make sure these settings are configured correctly:
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>DTMF Mode: RFC2833 (preferred)</li>
            <li>Codec Priority: PCMU (G.711 μ-law), PCMA (G.711 A-law)</li>
            <li>Enable Registration: Yes</li>
            <li>NAT Traversal: STUN or Auto</li>
          </ul>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Server className="h-5 w-5" />
            Step 4: Save and Restart
          </h3>
          <p className="text-sm text-muted-foreground">
            After entering all settings:
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Save your configuration</li>
            <li>Restart the SIP service or reboot the device</li>
            <li>Check the registration status to ensure it shows "Registered"</li>
          </ul>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mt-4">
          <h4 className="text-base font-medium mb-2 text-green-700 dark:text-green-300">
            Troubleshooting
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400">
            If your device fails to register:
          </p>
          <ul className="list-disc pl-5 text-sm text-green-600 dark:text-green-400">
            <li>Double-check all credentials and server information</li>
            <li>Ensure your GoIP device can reach our server (check firewall settings)</li>
            <li>Verify that ports 5060 (UDP/TCP) are open for SIP traffic</li>
            <li>Check your device's logs for specific error messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
