
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { generateSipConfig, validateSipConfigParams } from "./configUtils";
import { ConfigFormField } from "./components/ConfigFormField";
import { ValidationError } from "./components/ValidationError";
import { GenerateConfigButton } from "./components/GenerateConfigButton";
import { ConfigOutput } from "./components/ConfigOutput";
import { useAuth } from "@/contexts/auth";
import { useGreetingFiles } from "@/hooks/useGreetingFiles";
import { TransferNumber } from "@/types/transferNumber";
import { useFetchTransferNumbers } from "@/hooks/transfer-numbers/useFetchTransferNumbers";

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
  const [transferNumbers, setTransferNumbers] = useState<TransferNumber[]>([]);
  const [isLoadingTransferNumbers, setIsLoadingTransferNumbers] = useState(false);
  const [transferNumbersError, setTransferNumbersError] = useState<string | null>(null);
  
  // Get the authenticated user
  const { user } = useAuth();
  
  // Fetch greeting files using the existing hook
  const { greetingFiles, isLoading: isLoadingGreetingFiles } = useGreetingFiles();
  
  // Setup transfer number fetching
  const { fetchTransferNumbers } = useFetchTransferNumbers({
    setTransferNumbers,
    setIsLoading: setIsLoadingTransferNumbers,
    setError: setTransferNumbersError
  });
  
  // Fetch transfer numbers when component mounts
  useEffect(() => {
    if (user) {
      fetchTransferNumbers();
    }
  }, [user, fetchTransferNumbers]);

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
      // Pass greeting files and transfer numbers to generate a more complete config
      const configText = generateSipConfig(
        providerName,
        host,
        port,
        providerUsername,
        providerPassword,
        greetingFiles,
        transferNumbers
      );
      
      setConfigOutput(configText);
      
      toast({
        title: "Configuration Generated",
        description: "SIP configuration has been generated successfully",
      });
    } catch (error: any) {
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
          Generate Asterisk configuration for your SIP provider. The system will automatically include your existing 
          greeting files and transfer numbers in the generated configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ValidationError error={validationError} />
        
        {/* Display a loading state if fetching data */}
        {(isLoadingGreetingFiles || isLoadingTransferNumbers) && (
          <div className="text-sm text-muted-foreground">
            Loading your greeting files and transfer numbers...
          </div>
        )}
        
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
        
        {/* Summary of available resources */}
        <div className="p-3 bg-muted rounded-md text-sm">
          <p className="font-medium mb-1">Available Resources:</p>
          <p className="mb-1">Greeting Files: {isLoadingGreetingFiles ? "Loading..." : greetingFiles.length} available</p>
          <p>Transfer Numbers: {isLoadingTransferNumbers ? "Loading..." : transferNumbers.length} available</p>
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
