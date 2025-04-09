
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download, Server, Code, FileText, Settings } from 'lucide-react';
import { generateAsteriskConfigs } from '@/utils/asterisk/configGenerator';
import { toast } from '@/components/ui/use-toast';

interface AsteriskConfigDisplayProps {
  username: string;
  password: string;
  host?: string;
  port?: number;
}

export const AsteriskConfigDisplay: React.FC<AsteriskConfigDisplayProps> = ({
  username,
  password,
  host = '0.0.0.0',
  port = 5060
}) => {
  const [configs, setConfigs] = useState(() => 
    generateAsteriskConfigs(username, password, host, port)
  );
  
  const [activeTab, setActiveTab] = useState('sip');
  const [hostInput, setHostInput] = useState(host);
  const [portInput, setPortInput] = useState(port.toString());

  // Regenerate configs when inputs change
  useEffect(() => {
    setConfigs(generateAsteriskConfigs(
      username,
      password,
      host,
      port
    ));
  }, [username, password, host, port]);

  // Apply config changes
  const handleApplyChanges = () => {
    const newPort = parseInt(portInput);
    
    if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
      toast({
        title: 'Invalid port number',
        description: 'Please enter a valid port number between 1 and 65535',
        variant: 'destructive'
      });
      return;
    }
    
    // Regenerate configs with new settings
    setConfigs(generateAsteriskConfigs(
      username,
      password,
      hostInput,
      newPort
    ));
    
    toast({
      title: 'Configuration updated',
      description: 'The Asterisk configuration has been updated'
    });
  };

  // Copy config to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    
    toast({
      title: 'Copied to clipboard',
      description: `${type} configuration has been copied to clipboard`
    });
  };

  // Download config as file
  const downloadConfig = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Asterisk Configuration
        </CardTitle>
        <CardDescription>
          Configuration files for setting up the Asterisk autodialer
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="sip" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="sip">SIP</TabsTrigger>
            <TabsTrigger value="dialplan">Dialplan</TabsTrigger>
            <TabsTrigger value="agi">AGI Script</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sip">
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium">SIP Configuration</h3>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(configs.sipConfig, 'SIP')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadConfig(configs.sipConfig, 'sip_autodialer.conf')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[300px] w-full rounded-md border bg-muted">
                <pre className="p-4 text-xs">
                  {configs.sipConfig}
                </pre>
              </ScrollArea>
              
              <p className="text-xs text-muted-foreground">
                Save this configuration to /etc/asterisk/sip_autodialer.conf
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="dialplan">
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium">Dialplan Configuration</h3>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(configs.dialplanConfig, 'Dialplan')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadConfig(configs.dialplanConfig, 'extensions_autodialer.conf')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[300px] w-full rounded-md border bg-muted">
                <pre className="p-4 text-xs">
                  {configs.dialplanConfig}
                </pre>
              </ScrollArea>
              
              <p className="text-xs text-muted-foreground">
                Save this configuration to /etc/asterisk/extensions_autodialer.conf
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="agi">
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium">AGI Script</h3>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(configs.agiScript, 'AGI Script')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadConfig(configs.agiScript, 'autodialer.agi')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[300px] w-full rounded-md border bg-muted">
                <pre className="p-4 text-xs">
                  {configs.agiScript}
                </pre>
              </ScrollArea>
              
              <p className="text-xs text-muted-foreground">
                Save this script to /var/lib/asterisk/agi-bin/autodialer.agi and make it executable
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Configuration Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sipHost">SIP Host</Label>
                  <Input 
                    id="sipHost" 
                    value={hostInput} 
                    onChange={(e) => setHostInput(e.target.value)}
                    placeholder="0.0.0.0"
                  />
                  <p className="text-xs text-muted-foreground">
                    The IP address to bind for SIP communications
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sipPort">SIP Port</Label>
                  <Input 
                    id="sipPort" 
                    value={portInput} 
                    onChange={(e) => setPortInput(e.target.value)}
                    type="number"
                    min="1"
                    max="65535"
                    placeholder="5060"
                  />
                  <p className="text-xs text-muted-foreground">
                    The port number for SIP communications
                  </p>
                </div>
              </div>
              
              <Button onClick={handleApplyChanges}>
                <Settings className="h-4 w-4 mr-2" />
                Apply Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex-col items-start space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Installation Instructions
        </h3>
        <Button 
          variant="outline" 
          onClick={() => downloadConfig(configs.installInstructions, 'asterisk_autodialer_setup.md')}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Setup Instructions
        </Button>
      </CardFooter>
    </Card>
  );
};
