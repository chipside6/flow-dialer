import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Server, ServerCog, ShieldAlert, Terminal, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AsteriskConfigDisplay = ({
  username,
  password,
  host,
  port
}: {
  username: string;
  password: string;
  host: string;
  port: number;
}) => {
  const { toast } = useToast();
  const [showCommand, setShowCommand] = useState<boolean>(false);
  
  // Format deployment command
  const deployCommand = `
#!/bin/bash
# Production Asterisk deployment script
# This script should be run on your Asterisk server

# Save your campaign ID and user ID here
CAMPAIGN_ID="your-campaign-id"  # Replace with your actual campaign ID
USER_ID="your-user-id"          # Replace with your actual user ID
SUPABASE_URL="your-supabase-url" # Replace with your Supabase URL
JWT_TOKEN="your-service-role-jwt" # Get from Supabase dashboard (service role key)

# Run the deployment script
node deploy-asterisk-config.js $CAMPAIGN_ID $USER_ID $SUPABASE_URL $JWT_TOKEN
`.trim();

  const handleCopyConfig = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: `${type} configuration copied successfully`,
        });
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard",
          variant: "destructive",
        });
      });
  };

  const sipConfig = `
; SIP Configuration for Asterisk (PJSIP)
[${username}]
type=endpoint
transport=transport-udp
context=from-goip
disallow=all
allow=ulaw
allow=alaw
direct_media=no
trust_id_inbound=no
device_state_busy_at=1
dtmf_mode=rfc4733
rtp_timeout=30
call_group=1
pickup_group=1
language=en
host=${host}
auth=auth_${username}
aors=aor_${username}

[auth_${username}]
type=auth
auth_type=userpass
username=${username}
password=${password}

[aor_${username}]
type=aor
max_contacts=5
remove_existing=yes
minimum_expiration=60
maximum_expiration=3600
qualify_frequency=60
`.trim();

  const securityNote = `
# SECURITY NOTES FOR PRODUCTION DEPLOYMENT

## Asterisk Server Hardening
- Use strong passwords for all SIP accounts
- Configure proper firewall rules (allow only necessary ports)
- Keep Asterisk updated with security patches
- Use TLS for SIP communication when possible
- Limit API access by IP address

## JWT Token Security
- Never expose your service role JWT in client-side code
- Store JWT securely on your server
- Rotate JWT regularly
- Use storage encryption for sensitive credentials

## Deployment Best Practices
- Run deployment scripts only from secure, trusted environments
- Monitor logs for unusual activity
- Implement rate limiting on your Asterisk server
- Use separate user accounts with limited permissions
- Back up configurations regularly
`.trim();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Asterisk Production Configuration
            </div>
            <Badge variant="outline" className="ml-2">Production Ready</Badge>
          </CardTitle>
          <CardDescription>
            Configuration settings for your Asterisk server in production
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="sip">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="sip">SIP Config</TabsTrigger>
              <TabsTrigger value="deploy">Deployment</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sip" className="space-y-4">
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyConfig(sipConfig, 'SIP')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-80 w-full rounded-md border p-4">
                  <pre className="text-sm">{sipConfig}</pre>
                </ScrollArea>
              </div>
              
              <div className="bg-muted rounded-md p-4">
                <h4 className="font-medium mb-2">Connection Details:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Username:</div>
                  <div>{username}</div>
                  <div className="font-medium">Password:</div>
                  <div>{password.replace(/./g, '•')}</div>
                  <div className="font-medium">Host:</div>
                  <div>{host}</div>
                  <div className="font-medium">Port:</div>
                  <div>{port}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="deploy" className="space-y-4">
              <Alert variant="default">
                <AlertTitle className="flex items-center">
                  <ServerCog className="h-4 w-4 mr-2" />
                  Deployment Instructions
                </AlertTitle>
                <AlertDescription>
                  <p className="mb-2">To deploy on your production Asterisk server:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Install Node.js on your Asterisk server</li>
                    <li>Copy the <code>deploy-asterisk-config.js</code> script to your server</li>
                    <li>Install dependencies: <code>npm install node-fetch@^3</code></li>
                    <li>Run the script as shown below with your campaign ID</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyConfig(deployCommand, 'Deployment')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <pre className="text-sm">{deployCommand}</pre>
                </ScrollArea>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowCommand(!showCommand)}
                className="w-full"
              >
                {showCommand ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Example Command
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Example Command
                  </>
                )}
              </Button>
              
              {showCommand && (
                <div className="bg-muted rounded-md p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Terminal className="h-4 w-4 mr-2" />
                    Example Deployment Command:
                  </h4>
                  <code className="block text-sm bg-background p-2 rounded border">
                    node deploy-asterisk-config.js campaign-123 user-456 https://your-project.supabase.co eyJhbGciOiJIU...
                  </code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Note: Replace with your actual campaign ID, user ID, Supabase URL, and JWT token.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <Alert variant="warning">
                <AlertTitle className="flex items-center">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Security Recommendations
                </AlertTitle>
                <AlertDescription>
                  Follow these security recommendations for your production setup.
                </AlertDescription>
              </Alert>
              
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyConfig(securityNote, 'Security')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <pre className="text-sm">{securityNote}</pre>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AsteriskConfigDisplay;
