
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const AsteriskGuide = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asterisk Integration Guide</CardTitle>
        <CardDescription>
          Technical information for advanced users who want to understand the Asterisk integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            Our system integrates with your GoIP device through an Asterisk SIP server. When you 
            generate credentials, the following configurations are automatically created:
          </p>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-mono text-sm font-medium mb-2">SIP Configuration</h4>
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
{`[goip_user_{user_id}_port{port_number}]
type=peer
host=dynamic
context=from-goip
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no
transport=udp`}
            </pre>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-mono text-sm font-medium mb-2">Dialplan Integration</h4>
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
{`[from-goip]
exten => _X.,1,NoOp(Incoming call from GoIP device)
exten => _X.,n,Set(CALLERID(name)=\${CALLERID(num)})
exten => _X.,n,Goto(from-trunk,\${EXTEN},1)`}
            </pre>
          </div>
          
          <h3 className="text-base font-medium mt-6">How Campaigns Use Your Device</h3>
          <p className="text-sm text-muted-foreground">
            When you start a campaign, our system will:
          </p>
          <ol className="list-decimal pl-5 text-sm text-muted-foreground">
            <li>Load the contacts from your campaign</li>
            <li>Use Asterisk's Originate API to initiate calls through your GoIP device</li>
            <li>Play your greeting message when the call is answered</li>
            <li>Handle transfers if the recipient presses the designated key</li>
            <li>Log all call activity and results in your dashboard</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
