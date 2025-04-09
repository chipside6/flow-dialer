
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const AsteriskGuide = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asterisk Technical Guide</CardTitle>
        <CardDescription>
          Detailed technical information for advanced users who want to understand the Asterisk integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="configuration">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="dialplan">Dialplan</TabsTrigger>
            <TabsTrigger value="call-flow">Call Flow</TabsTrigger>
          </TabsList>
          
          <TabsContent value="configuration" className="space-y-4">
            <p>
              Our system integrates with your GoIP device through an Asterisk SIP server. When you 
              generate credentials, the following configurations are automatically created:
            </p>
            
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-mono text-sm font-medium mb-2">SIP Configuration</h4>
              <ScrollArea className="h-[200px]">
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
              </ScrollArea>
            </div>
            
            <p className="text-muted-foreground text-sm mt-2">
              This configuration creates a dynamic SIP peer for each GoIP port. The <code>context=from-goip</code> setting routes incoming calls to the correct dialplan.
            </p>
            
            <div className="bg-muted p-4 rounded-md mt-4">
              <h4 className="font-mono text-sm font-medium mb-2">Required Modules</h4>
              <ScrollArea className="h-[150px]">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
{`; Required modules in modules.conf
load => app_dial.so       ; For making calls
load => app_playback.so   ; For playing audio files
load => app_record.so     ; For recording calls
load => app_read.so       ; For reading DTMF
load => app_voicemail.so  ; For voicemail detection
load => app_amd.so        ; For answering machine detection
load => res_agi.so        ; For AGI functionality
load => chan_sip.so       ; For SIP functionality`}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="dialplan" className="space-y-4">
            <p>
              The Asterisk dialplan controls the call flow for both incoming and outgoing calls:
            </p>
            
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-mono text-sm font-medium mb-2">Incoming Call Dialplan</h4>
              <ScrollArea className="h-[200px]">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
{`[from-goip]
exten => _X.,1,NoOp(Incoming call from GoIP device)
exten => _X.,n,Set(CALLERID(name)=\${CALLERID(num)})
exten => _X.,n,Goto(from-trunk,\${EXTEN},1)

[from-trunk]
exten => _X.,1,NoOp(Handling incoming trunk call)
exten => _X.,n,Answer()
exten => _X.,n,Wait(1)
exten => _X.,n,Playback(incoming-call)
exten => _X.,n,Dial(SIP/internal/\${EXTEN},30)
exten => _X.,n,Hangup()`}
                </pre>
              </ScrollArea>
            </div>
            
            <div className="bg-muted p-4 rounded-md mt-4">
              <h4 className="font-mono text-sm font-medium mb-2">Outgoing Call Dialplan (Campaign)</h4>
              <ScrollArea className="h-[250px]">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
{`[autodialer]
exten => s,1,NoOp(Autodialer call started)
exten => s,n,Answer()
exten => s,n,AMD()
exten => s,n,GotoIf($["$\{AMDSTATUS\}" = "HUMAN"]?playmsg,1:hangup,1)

exten => playmsg,1,NoOp(Human detected, playing greeting)
exten => playmsg,n,Playback(\${GREETING_FILE})
exten => playmsg,n,Read(digit,1,5)
exten => playmsg,n,GotoIf($["$\{digit\}" = "1"]?transfer,1:hangup,1)

exten => transfer,1,NoOp(Transferring call to \${TRANSFER_NUMBER})
exten => transfer,n,Set(TRANSFER_REQUESTED=1)
exten => transfer,n,Dial(SIP/\${TRANSFER_NUMBER},30,g)
exten => transfer,n,Hangup()

exten => hangup,1,NoOp(Call ended without transfer)
exten => hangup,n,Hangup()`}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="call-flow" className="space-y-4">
            <h3 className="text-base font-medium mb-4">Campaign Call Flow Diagram</h3>
            
            <div className="bg-muted p-6 rounded-md">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-center">
{`┌───────────────────┐
│ Campaign Started  │
└──────────┬────────┘
           ▼
┌───────────────────┐
│   Load Contacts   │
└──────────┬────────┘
           ▼
┌───────────────────┐
│  Originate Call   │
│ via GoIP Device   │
└──────────┬────────┘
           ▼
┌───────────────────┐
│  Call Connected?  │
└──────────┬────────┘
           ▼
┌───────────────────┐    No     ┌───────────────┐
│ AMD: Human Voice? ├──────────►│ Log & Hangup  │
└──────────┬────────┘            └───────────────┘
           │ Yes
           ▼
┌───────────────────┐
│   Play Greeting   │
└──────────┬────────┘
           ▼
┌───────────────────┐    No     ┌───────────────┐
│ Pressed 1 to      ├──────────►│ Log & Hangup  │
│ Transfer?         │           └───────────────┘
└──────────┬────────┘
           │ Yes
           ▼
┌───────────────────┐
│  Transfer Call    │
│  to Agent Number  │
└──────────┬────────┘
           ▼
┌───────────────────┐
│  Log Call Result  │
└───────────────────┘`}
              </pre>
            </div>
            
            <h3 className="text-base font-medium mt-6 mb-4">How Campaigns Use Your Device</h3>
            <p className="text-sm text-muted-foreground">
              When you start a campaign, our system will:
            </p>
            <ol className="list-decimal pl-5 text-sm text-muted-foreground">
              <li>Load the contacts from your selected lead list</li>
              <li>Use Asterisk's Originate API to initiate calls through your GoIP device</li>
              <li>Implement Answering Machine Detection (AMD) to identify human answers</li>
              <li>Play your greeting message when a human answers the call</li>
              <li>Listen for DTMF input (when the person presses 1)</li>
              <li>Handle transfers to your designated transfer number</li>
              <li>Log all call activity and results in your dashboard</li>
            </ol>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h4 className="text-sm font-medium mb-2">Advanced Call Management</h4>
              <p className="text-xs text-muted-foreground">
                Our system handles retries, concurrent call limits, and call pacing automatically.
                The GoIP device handles SIP registration and audio path, while Asterisk manages the 
                call logic and interaction with the called party.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
