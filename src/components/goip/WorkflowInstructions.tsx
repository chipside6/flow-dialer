
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Info, Server, Phone, Globe, Layers, FileCode, CheckCircle2 } from "lucide-react";

export const WorkflowInstructions = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          GoIP and Asterisk Integration Workflow
        </CardTitle>
        <CardDescription>
          Complete setup guide for integrating your GoIP device with Asterisk for outbound campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This comprehensive workflow covers the end-to-end setup process. Follow each step carefully to ensure proper integration.
          </AlertDescription>
        </Alert>
        
        {/* Step 1: Server Setup */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-500" />
            <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold">Step 1</span>
            Asterisk Server Setup
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            First, ensure your Asterisk server is properly installed and configured:
          </p>
          <ScrollArea className="h-[150px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# Install Asterisk (on Debian/Ubuntu)
sudo apt update && sudo apt upgrade -y
sudo apt install -y asterisk asterisk-modules

# Configure firewall to allow SIP traffic
sudo ufw allow 5060/udp  # SIP signaling
sudo ufw allow 10000:20000/udp  # RTP media

# Edit main configuration files
sudo nano /etc/asterisk/sip.conf  # Add "#include sip_goip.conf" at the end
sudo nano /etc/asterisk/extensions.conf  # Add "#include extensions_goip.conf" at the end

# Create config files for GoIP integration
sudo touch /etc/asterisk/sip_goip.conf
sudo touch /etc/asterisk/extensions_goip.conf

# Set proper permissions
sudo chown asterisk:asterisk /etc/asterisk/sip_goip.conf
sudo chown asterisk:asterisk /etc/asterisk/extensions_goip.conf`}
            </pre>
          </ScrollArea>
        </div>
        
        <Separator />
        
        {/* Step 2: SIP Configuration */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <FileCode className="h-5 w-5 text-indigo-500" />
            <span className="bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-xs font-semibold">Step 2</span>
            SIP Configuration
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Configure the SIP settings for your GoIP device on the Asterisk server:
          </p>
          <ScrollArea className="h-[180px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# GoIP SIP configuration (/etc/asterisk/sip_goip.conf)
[goip_user1]
type=friend
context=from-goip
host=dynamic          ; GoIP will register from its IP
secret=yourpassword   ; Set a strong password
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite  ; Allows the GoIP to register from any port
nat=force_rport,comedia
qualify=yes
canreinvite=no
directmedia=no

; For multiple ports, create additional entries:
[goip_user2]
type=friend
context=from-goip
host=dynamic
secret=anotherpassword
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
canreinvite=no
directmedia=no`}
            </pre>
          </ScrollArea>
        </div>
        
        <Separator />
        
        {/* Step 3: Dialplan Configuration */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Terminal className="h-5 w-5 text-purple-500" />
            <span className="bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-xs font-semibold">Step 3</span>
            Dialplan Configuration
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Create the dialplan for handling incoming and outgoing calls:
          </p>
          <ScrollArea className="h-[180px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# GoIP Extensions configuration (/etc/asterisk/extensions_goip.conf)
[from-goip]
exten => _X.,1,NoOp(Incoming call from GoIP device)
exten => _X.,n,Answer()
exten => _X.,n,Set(CALLERID(name)=\${CALLERID(num)})
exten => _X.,n,Playback(hello-world)
exten => _X.,n,Hangup()

[outbound-goip]
exten => _X.,1,NoOp(Outbound call through GoIP)
exten => _X.,n,Set(CALLERID(all)=\${OUTBOUND_CALLERID})
exten => _X.,n,Dial(SIP/\${EXTEN}@goip_user1)
exten => _X.,n,Hangup()

[campaign-dialplan]
exten => _X.,1,NoOp(Campaign call to \${EXTEN})
exten => _X.,n,Set(CAMPAIGN_ID=\${CAMPAIGN_ID})
exten => _X.,n,Set(CALLERID(all)=\${OUTBOUND_CALLERID})
exten => _X.,n,Dial(SIP/\${EXTEN}@goip_user1,30,g)
exten => _X.,n,GotoIf($["${DIALSTATUS}" = "ANSWER"]?answered:failed)
exten => _X.,n(answered),Playback(your-campaign-message)
exten => _X.,n,Read(digit,press-1-to-connect,1)
exten => _X.,n,GotoIf($["${digit}" = "1"]?transfer,1:hangup)
exten => _X.,n(failed),NoOp(Call failed with \${DIALSTATUS})
exten => _X.,n(hangup),Hangup()

exten => transfer,1,NoOp(Transferring call to \${TRANSFER_NUMBER})
exten => transfer,n,Dial(SIP/\${TRANSFER_NUMBER}@goip_user1,30)
exten => transfer,n,Hangup()`}
            </pre>
          </ScrollArea>
        </div>
        
        <Separator />
        
        {/* Step 4: GoIP Device Configuration */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-500" />
            <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-semibold">Step 4</span>
            GoIP Device Configuration
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Configure your GoIP device to connect to your Asterisk server:
          </p>
          <ScrollArea className="h-[180px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# Access your GoIP device admin panel (typically http://[GoIP-IP-ADDRESS])
# Navigate to the SIP Settings section and configure:

For Port 1:
SIP Proxy Server: [Your Asterisk Server IP]
SIP Proxy Server Port: 5060
SIP User ID: goip_user1
SIP Password: yourpassword
Registration Expiry: 180 (seconds)
SIP Domain/Realm: [Your Asterisk Server IP] or leave blank
Multiple Registrations: Disabled

# Repeat for each additional port with the corresponding user (goip_user2, etc.)

# In the Call Settings section:
Dial Plan: X.
Auto Answer: Enabled (if needed for campaigns)

# In the Network Settings:
Ensure correct IP configuration (static IP recommended)
Make sure the device can reach your Asterisk server

# Save all settings and reboot the GoIP device`}
            </pre>
          </ScrollArea>
        </div>
        
        <Separator />
        
        {/* Step 5: Testing */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-500" />
            <span className="bg-amber-100 text-amber-800 rounded-full px-3 py-1 text-xs font-semibold">Step 5</span>
            Testing the Integration
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Verify your GoIP-Asterisk integration is working correctly:
          </p>
          <ScrollArea className="h-[150px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# On the Asterisk server, check if GoIP is registered:
asterisk -rx "sip show peers" | grep goip

# Should show something like:
# goip_user1/goip_user1   192.168.1.100   5060  OK (14 ms)

# To monitor SIP activity in real-time:
asterisk -rvvv

# In the Asterisk CLI, use:
sip set debug on
core set verbose 5

# Make a test call through the system
# Check both incoming calls (to Asterisk from GoIP)
# and outgoing calls (from Asterisk through GoIP)

# To test outbound calling through your campaign:
# Use the web interface to create a campaign and send a test call`}
            </pre>
          </ScrollArea>
        </div>
        
        <Separator />
        
        {/* Step 6: Campaign Integration */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Globe className="h-5 w-5 text-rose-500" />
            <span className="bg-rose-100 text-rose-800 rounded-full px-3 py-1 text-xs font-semibold">Step 6</span>
            Campaign Integration
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Connect your autodialer campaigns with your GoIP ports:
          </p>
          <ScrollArea className="h-[180px] w-full rounded-md border bg-muted p-4">
            <pre className="text-xs">
{`# Using the web interface:
1. Create a new campaign in the Campaigns section
2. Assign specific GoIP ports to the campaign
3. Set up transfer numbers if needed
4. Configure greeting messages
5. Upload contact lists
6. Start the campaign

# The system will:
- Automatically assign calls to available ports
- Monitor call progress
- Handle transfers when "1" is pressed
- Track analytics and success rates

# For multi-port campaigns:
- The system will distribute calls across all assigned ports
- Each port works independently, maximizing throughput
- Campaign settings apply uniformly across all ports`}
            </pre>
          </ScrollArea>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mt-6">
          <h4 className="text-base font-medium mb-2 text-green-700 dark:text-green-300 flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Complete Workflow
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400">
            By following this workflow, you've successfully integrated your GoIP device with your Asterisk server for outbound campaigns. Your autodialer system is now ready to make calls, handle transfers, and track campaign performance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
