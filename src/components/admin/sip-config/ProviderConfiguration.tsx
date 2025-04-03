
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { generateSipConfig, validateSipConfigParams } from "./configUtils";
import { ConfigFormField } from "./components/ConfigFormField";
import { ValidationError } from "./components/ValidationError";
import { GenerateConfigButton } from "./components/GenerateConfigButton";
import { ConfigOutput } from "./components/ConfigOutput";

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
        <ValidationError error={validationError} />
        
        <ConfigFormField 
          id="provider-name"
          label="Provider Name"
          tooltip="A short, unique identifier for this SIP provider (e.g., twilio, vonage). Avoid spaces and special characters."
          value={providerName}
          onChange={(e) => setProviderName(e.target.value)}
          placeholder="my-sip-provider"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigFormField 
            id="host"
            label="Host/Server"
            tooltip="The hostname or IP address of your SIP provider's server (e.g., sip.provider.com)."
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="sip.provider.com"
          />
          
          <ConfigFormField 
            id="port"
            label="Port"
            tooltip="The port used by your SIP provider. Default is 5060 for unencrypted SIP, 5061 for TLS."
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="5060"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigFormField 
            id="provider-username"
            label="Username/Account ID"
            tooltip="The username or account ID provided by your SIP provider."
            value={providerUsername}
            onChange={(e) => setProviderUsername(e.target.value)}
            placeholder="sipuser"
          />
          
          <ConfigFormField 
            id="provider-password"
            label="Password/API Key"
            tooltip="The password or API key provided by your SIP provider."
            value={providerPassword}
            onChange={(e) => setProviderPassword(e.target.value)}
            placeholder="sippassword"
            type="password"
          />
        </div>
        
        <GenerateConfigButton 
          onGenerate={generateConfig}
          isGenerating={isGenerating}
        />
        
        <ConfigOutput configOutput={configOutput} />
      </CardContent>
    </Card>
  );
};

export default ProviderConfiguration;
