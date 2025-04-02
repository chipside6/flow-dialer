
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle2, Loader2, TestTube, Copy } from "lucide-react";
import { generateSipConfig } from "./configUtils";

interface ProviderConfigurationProps {
  providerName: string;
  host: string;
  port: string;
  providerUsername: string;
  providerPassword: string;
  setProviderName: (name: string) => void;
  setHost: (host: string) => void;
  setPort: (port: string) => void;
  setProviderUsername: (username: string) => void;
  setProviderPassword: (password: string) => void;
}

const ProviderConfiguration: React.FC<ProviderConfigurationProps> = ({
  providerName,
  host,
  port,
  providerUsername,
  providerPassword,
  setProviderName,
  setHost,
  setPort,
  setProviderUsername,
  setProviderPassword
}) => {
  const [configOutput, setConfigOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyingToClipboard, setCopyingToClipboard] = useState(false);

  const generateConfig = () => {
    setIsGenerating(true);
    
    try {
      const configText = generateSipConfig(
        providerName,
        host,
        port,
        providerUsername,
        providerPassword
      );
      
      setConfigOutput(configText);
      
      toast({
        title: "Configuration Generated",
        description: "SIP configuration has been generated successfully",
      });
    } catch (error) {
      toast({
        title: "Generation Error",
        description: `Failed to generate configuration: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyConfig = () => {
    setCopyingToClipboard(true);
    try {
      navigator.clipboard.writeText(configOutput);
      toast({
        title: "Copied to Clipboard",
        description: "Configuration has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: `Could not copy to clipboard: ${error.message}`,
        variant: "destructive"
      });
    }
    setTimeout(() => setCopyingToClipboard(false), 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SIP Provider Configuration Generator</CardTitle>
        <CardDescription>
          Generate Asterisk configuration for your SIP provider. The system will automatically include your campaign's 
          transfer numbers and greeting audio files when generating configurations for actual campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider-name">Provider Name</Label>
          <Input
            id="provider-name"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder="my-sip-provider"
            className="focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host/Server</Label>
            <Input
              id="host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="sip.provider.com"
              className="focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="5060"
              className="focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="provider-username">Username/Account ID</Label>
            <Input
              id="provider-username"
              value={providerUsername}
              onChange={(e) => setProviderUsername(e.target.value)}
              placeholder="sipuser"
              className="focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="provider-password">Password/API Key</Label>
            <Input
              id="provider-password"
              type="password"
              value={providerPassword}
              onChange={(e) => setProviderPassword(e.target.value)}
              placeholder="sippassword"
              className="focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <Button 
          onClick={generateConfig} 
          disabled={isGenerating}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TestTube className="h-4 w-4" />
          )}
          Generate Configuration
        </Button>
        
        {configOutput && (
          <div className="space-y-2 pt-4">
            <Label htmlFor="config-output">Configuration Output</Label>
            <Textarea
              id="config-output"
              value={configOutput}
              readOnly
              rows={15}
              className="font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Button 
              variant="outline" 
              onClick={handleCopyConfig}
              className="active:scale-95 transition-transform"
              disabled={copyingToClipboard}
            >
              {copyingToClipboard ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copyingToClipboard ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderConfiguration;
