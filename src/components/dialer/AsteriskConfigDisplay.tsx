
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  
  const sipConfig = `[${username}]
type=friend
host=dynamic
secret=${password}
context=autodialer
disallow=all
allow=ulaw
allow=alaw
nat=force_rport,comedia
qualify=yes
`;

  const extensionsConfig = `[autodialer]
exten => s,1,Answer()
exten => s,n,Wait(1)
exten => s,n,Playback(\${GREETING_FILE})
exten => s,n,WaitExten(5)
exten => s,n,Hangup()

; Handle keypress 1 for transfer
exten => 1,1,NoOp(Transferring call to \${TRANSFER_NUMBER})
exten => 1,n,Dial(SIP/\${TRANSFER_NUMBER})
exten => 1,n,Hangup()
`;

  const agiScript = `#!/usr/bin/env python
import sys
from asterisk.agi import AGI

agi = AGI()
agi.answer()

# Get variables passed from the dialplan
greeting_file = agi.get_variable('GREETING_FILE')
transfer_number = agi.get_variable('TRANSFER_NUMBER')
user_id = agi.get_variable('USER_ID')
campaign_id = agi.get_variable('CAMPAIGN_ID')

# Play greeting
agi.exec('Playback', greeting_file)

# Wait for DTMF input (keypress)
result = agi.wait_for_digit(5000)  # Wait 5 seconds for input

if result == 49:  # ASCII for '1'
    agi.verbose("Customer pressed 1, transferring to %s" % transfer_number)
    agi.exec('Dial', 'SIP/%s' % transfer_number)
else:
    agi.verbose("No transfer requested or timeout")

# Log call result to database
# (This would be handled by your custom logging module)

agi.hangup()
`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      toast({
        title: 'Copied!',
        description: `${type} configuration copied to clipboard.`,
      });
      
      setTimeout(() => setCopied(null), 2000);
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asterisk Configuration</CardTitle>
        <CardDescription>
          Use these configurations to set up your Asterisk server for this campaign.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sip">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="sip">SIP Configuration</TabsTrigger>
            <TabsTrigger value="dialplan">Dialplan</TabsTrigger>
            <TabsTrigger value="agi">AGI Script</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sip" className="relative">
            <pre className="p-4 rounded-md bg-slate-100 dark:bg-slate-800 overflow-x-auto">
              <code>{sipConfig}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(sipConfig, 'SIP')}
            >
              {copied === 'SIP' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TabsContent>
          
          <TabsContent value="dialplan" className="relative">
            <pre className="p-4 rounded-md bg-slate-100 dark:bg-slate-800 overflow-x-auto">
              <code>{extensionsConfig}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(extensionsConfig, 'Dialplan')}
            >
              {copied === 'Dialplan' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TabsContent>
          
          <TabsContent value="agi" className="relative">
            <pre className="p-4 rounded-md bg-slate-100 dark:bg-slate-800 overflow-x-auto">
              <code>{agiScript}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => handleCopy(agiScript, 'AGI')}
            >
              {copied === 'AGI' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 p-4 border border-border rounded-md bg-muted/50">
          <h3 className="font-medium mb-2">Connection Details</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Host:</p>
              <p className="text-sm">{host}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Port:</p>
              <p className="text-sm">{port}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Username:</p>
              <p className="text-sm">{username}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Password:</p>
              <p className="text-sm">{password}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
