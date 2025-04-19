import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { masterConfigGenerator } from '@/utils/asterisk/generators/masterConfigGenerator';
import { SipConfigSection } from './configs/SipConfigSection';
import { ExtensionsSection } from './configs/ExtensionsSection';
import { GoipConfigSection } from './configs/GoipConfigSection';

interface AsteriskConfigDisplayProps {
  username: string;
  password: string;
  host: string;
  port: number;
}

export const AsteriskConfigDisplay: React.FC<AsteriskConfigDisplayProps> = ({
  username,
  password,
  host,
  port
}) => {
  const [activeTab, setActiveTab] = useState('sip');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Config templates
  const sipConfig = `
[${username}]
type=peer
host=dynamic
context=from-goip
secret=${password}
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no
`;
  const extensionsConfig = `
[from-goip]
exten => _X.,1,NoOp(Incoming call from GoIP device)
exten => _X.,n,Set(CALLERID(name)=\${CALLERID(num)})
exten => _X.,n,Goto(autodialer,s,1)

[autodialer]
exten => s,1,NoOp(Autodialer call started)
exten => s,n,Answer()
exten => s,n,Wait(1)
exten => s,n,Set(TIMEOUT(digit)=5)
exten => s,n,Set(TIMEOUT(response)=10)
exten => s,n,Playback(greeting)
exten => s,n,WaitExten(5)
exten => s,n,Hangup()

; Handle key press 1 for transfer
exten => 1,1,NoOp(Transferring call)
exten => 1,n,Dial(SIP/transfer-number,30,g)
exten => 1,n,Hangup()

; Handle hangup
exten => h,1,NoOp(Call ended)
`;
  const agiScript = `#!/usr/bin/env python3
import sys
import os
from asterisk.agi import AGI

# Initialize AGI
agi = AGI()
agi.verbose("Autodialer AGI script started")

# Get campaign ID and user ID from arguments
campaign_id = sys.argv[1] if len(sys.argv) > 1 else "unknown"
user_id = sys.argv[2] if len(sys.argv) > 2 else "unknown"
transfer_number = sys.argv[3] if len(sys.argv) > 3 else "0"

# Log call start
agi.verbose(f"Processing call for campaign {campaign_id} and user {user_id}")

# Play greeting
agi.appexec("Playback", "greeting")

# Wait for digit
result = agi.get_data("beep", 10000, 1)

# Check if user pressed 1
if result == "1":
    agi.verbose("User pressed 1, transferring to " + transfer_number)
    agi.set_variable("TRANSFER_REQUESTED", "1")
    agi.appexec("Dial", f"SIP/{transfer_number},30,g")
else:
    agi.verbose("No digit received or not 1, hanging up")

agi.verbose("AGI script completed")
sys.exit(0)
`;
  const goipConfig = `
Account Settings:
Local Port: 5060
Register Port: 5060
Register Server: ${host}
Proxy Server: ${host}
User ID: ${username}
Authentication ID: ${username}
Authentication Password: ${password}
Register Expiry: 600
`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Configuration has been copied to your clipboard"
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded configuration",
      description: `${filename} has been downloaded`
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Server Configuration
        </CardTitle>
        <CardDescription>
          Copy these configurations to your Asterisk server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="sip">SIP Config</TabsTrigger>
            <TabsTrigger value="extensions">Dialplan</TabsTrigger>
            <TabsTrigger value="goip">GoIP Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sip">
            <SipConfigSection 
              sipConfig={sipConfig}
              onCopy={handleCopy}
              onDownload={handleDownload}
              copied={copied}
            />
          </TabsContent>
          
          <TabsContent value="extensions">
            <ExtensionsSection 
              extensionsConfig={extensionsConfig}
              agiScript={agiScript}
              onCopy={handleCopy}
              onDownload={handleDownload}
              copied={copied}
            />
          </TabsContent>
          
          <TabsContent value="goip">
            <GoipConfigSection 
              goipConfig={goipConfig}
              onCopy={handleCopy}
              copied={copied}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => handleDownload(masterConfigGenerator.generateMasterConfig(username, "config"), 'asterisk-autodialer-master.conf')}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Master Config
        </Button>
      </CardFooter>
    </Card>
  );
};
