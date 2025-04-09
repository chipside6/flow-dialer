
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Info, Server, Phone } from "lucide-react";

export const SetupInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Asterisk Installation Guide
        </CardTitle>
        <CardDescription>
          Step-by-step instructions for setting up Asterisk on your server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="info" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Requirements</AlertTitle>
          <AlertDescription>
            You'll need a Linux server (Ubuntu 20.04 or newer recommended) with root access.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Server className="h-5 w-5" />
            Step 1: Install Asterisk and Dependencies
          </h3>
          <ScrollArea className="h-[150px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# Update system
sudo apt update && sudo apt upgrade -y

# Install Asterisk and dependencies
sudo apt install -y asterisk asterisk-modules asterisk-core-sounds-en

# Install additional tools
sudo apt install -y jq curl python3 python3-pip
pip3 install asterisk-agi

# Check Asterisk is running
sudo systemctl status asterisk`}
            </pre>
          </ScrollArea>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Step 2: Configure SIP Settings
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Create or edit the SIP configuration file:
          </p>
          <ScrollArea className="h-[80px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# Edit SIP configuration file
sudo nano /etc/asterisk/sip.conf

# Add this line at the end of the file to include our configuration
#include "sip_goip.conf"`}
            </pre>
          </ScrollArea>
          
          <p className="text-sm text-muted-foreground mt-4 mb-2">
            Create the GoIP SIP configuration file:
          </p>
          <ScrollArea className="h-[80px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# Create GoIP SIP configuration file
sudo nano /etc/asterisk/sip_goip.conf

# Paste the SIP configuration from the "Server Configuration" tab`}
            </pre>
          </ScrollArea>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Step 3: Configure Dialplan
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Edit the extensions configuration file:
          </p>
          <ScrollArea className="h-[80px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# Edit extensions configuration file
sudo nano /etc/asterisk/extensions.conf

# Add this line at the end of the file to include our configuration
#include "extensions_autodialer.conf"`}
            </pre>
          </ScrollArea>
          
          <p className="text-sm text-muted-foreground mt-4 mb-2">
            Create the autodialer extensions configuration file:
          </p>
          <ScrollArea className="h-[80px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# Create autodialer extensions configuration file
sudo nano /etc/asterisk/extensions_autodialer.conf

# Paste the Dialplan configuration from the "Server Configuration" tab`}
            </pre>
          </ScrollArea>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Step 4: Create AGI Script
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Create the AGI script directory and file:
          </p>
          <ScrollArea className="h-[120px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# Create the AGI directory if it doesn't exist
sudo mkdir -p /var/lib/asterisk/agi-bin

# Create the AGI script file
sudo nano /var/lib/asterisk/agi-bin/autodialer.agi

# Paste the AGI Script from the "Server Configuration" tab

# Make the script executable
sudo chmod +x /var/lib/asterisk/agi-bin/autodialer.agi`}
            </pre>
          </ScrollArea>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Server className="h-5 w-5" />
            Step 5: Reload Asterisk Configuration
          </h3>
          <ScrollArea className="h-[100px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# Reload the Asterisk modules
sudo asterisk -rx "module reload"

# Reload the SIP configuration
sudo asterisk -rx "sip reload"

# Reload the dialplan
sudo asterisk -rx "dialplan reload"

# Verify the configuration
sudo asterisk -rx "sip show peers"`}
            </pre>
          </ScrollArea>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mt-4">
          <h4 className="text-base font-medium mb-2 text-green-700 dark:text-green-300">
            Congratulations!
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400">
            Your Asterisk server is now set up and ready to handle calls for your autodialer campaigns.
            Return to the GoIP Setup page to configure your device with the generated credentials.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
