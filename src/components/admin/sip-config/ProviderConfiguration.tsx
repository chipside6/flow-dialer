
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle2, Loader2, TestTube, Copy, HelpCircle } from "lucide-react";
import { generateSipConfig, validateSipConfigParams } from "./configUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [validationError, setValidationError] = useState<string | null>(null);

  const generateConfig = () => {
    // Validate inputs before generating config
    const error = validateSipConfigParams(
      providerName,
      host,
      port,
      providerUsername,
      providerPassword
    );
    
    if (error) {
      setValidationError(error);
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    setValidationError(null);
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

  const FieldLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
    <div className="flex items-center space-x-1">
      <Label>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

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
        {validationError && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start mb-4">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-destructive">{validationError}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <FieldLabel 
            label="Provider Name" 
            tooltip="A short, unique identifier for this SIP provider (e.g., twilio, vonage). Avoid spaces and special characters."
          />
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
            <FieldLabel 
              label="Host/Server" 
              tooltip="The hostname or IP address of your SIP provider's server (e.g., sip.provider.com)."
            />
            <Input
              id="host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="sip.provider.com"
              className="focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <FieldLabel 
              label="Port" 
              tooltip="The port used by your SIP provider. Default is 5060 for unencrypted SIP, 5061 for TLS."
            />
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
            <FieldLabel 
              label="Username/Account ID" 
              tooltip="The username or account ID provided by your SIP provider."
            />
            <Input
              id="provider-username"
              value={providerUsername}
              onChange={(e) => setProviderUsername(e.target.value)}
              placeholder="sipuser"
              className="focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <FieldLabel 
              label="Password/API Key" 
              tooltip="The password or API key provided by your SIP provider."
            />
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
            <div className="flex justify-between items-center">
              <Label htmlFor="config-output">Configuration Output</Label>
              <Button 
                variant="outline" 
                size="sm"
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
            <Textarea
              id="config-output"
              value={configOutput}
              readOnly
              rows={15}
              className="font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary"
            />
            
            <div className="bg-muted p-4 rounded-md mt-2">
              <h4 className="text-sm font-medium mb-1">How to use this configuration</h4>
              <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                <li>Copy the SIP Provider section to your pjsip.conf or sip.conf file</li>
                <li>Copy the Dialplan section to your extensions.conf file</li>
                <li>Replace the placeholders with your actual greeting file path and transfer number</li>
                <li>Reload Asterisk with: <code className="bg-muted-foreground/20 px-1 rounded">asterisk -rx "core reload"</code></li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderConfiguration;
