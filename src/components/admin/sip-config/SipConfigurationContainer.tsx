
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { asteriskService } from "@/utils/asteriskService";
import { asteriskConfig } from "@/utils/asterisk/configGenerators";
import { useGreetingFiles } from "@/hooks/useGreetingFiles";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { useSipProviders } from "@/hooks/useSipProviders";
import { Loader2, Server } from "lucide-react";
import { ConfigOutput } from "./components/ConfigOutput";
import { GenerateConfigButton } from "./components/GenerateConfigButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const SipConfigurationContainer = () => {
  const { user } = useAuth();
  const { greetingFiles, isLoading: isLoadingGreetingFiles } = useGreetingFiles();
  const { transferNumbers, isLoading: isLoadingTransferNumbers } = useTransferNumbers();
  const { providers, isLoading: isLoadingProviders } = useSipProviders();
  
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedGreetingId, setSelectedGreetingId] = useState<string>("");
  const [selectedTransferId, setSelectedTransferId] = useState<string>("");
  const [configOutput, setConfigOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filter for active providers only
  const activeProviders = providers.filter(p => p.isActive);
  
  // Reset selections if data changes
  useEffect(() => {
    if (activeProviders.length > 0 && !selectedProviderId) {
      setSelectedProviderId(activeProviders[0].id);
    }
    
    if (greetingFiles.length > 0 && !selectedGreetingId) {
      setSelectedGreetingId(greetingFiles[0].id);
    }
    
    if (transferNumbers.length > 0 && !selectedTransferId) {
      setSelectedTransferId(transferNumbers[0].id);
    }
  }, [activeProviders, greetingFiles, transferNumbers, selectedProviderId, selectedGreetingId, selectedTransferId]);
  
  const isLoading = isLoadingProviders || isLoadingGreetingFiles || isLoadingTransferNumbers;
  const isReady = !isLoading && activeProviders.length > 0 && greetingFiles.length > 0 && transferNumbers.length > 0;
  const isMissingResources = !isLoading && 
    (activeProviders.length === 0 || greetingFiles.length === 0 || transferNumbers.length === 0);
  
  const generateConfig = () => {
    if (!selectedProviderId || !selectedGreetingId || !selectedTransferId) {
      toast({
        title: "Missing selection",
        description: "Please select a provider, greeting file, and transfer number",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Find the selected resources
      const provider = activeProviders.find(p => p.id === selectedProviderId);
      const greeting = greetingFiles.find(g => g.id === selectedGreetingId);
      const transfer = transferNumbers.find(t => t.id === selectedTransferId);
      
      if (!provider || !greeting || !transfer) {
        throw new Error("Could not find selected resources");
      }
      
      // Generate the configuration
      const configText = asteriskConfig.generateFullConfig(
        "auto-campaign",
        provider.name,
        provider.host,
        provider.port,
        provider.username,
        provider.password,
        greeting.file_path || greeting.url,
        transfer.number || transfer.phone_number
      );
      
      setConfigOutput(configText);
      
      toast({
        title: "Configuration Generated",
        description: "Asterisk configuration has been generated successfully",
      });
      
      // Try to automatically reload the Asterisk configuration
      asteriskService.reloadPjsip()
        .then(() => {
          console.log("PJSIP configuration reloaded successfully");
          return asteriskService.reloadExtensions();
        })
        .then(() => {
          console.log("Extensions reloaded successfully");
          toast({
            title: "Asterisk Reloaded",
            description: "Configuration was automatically applied to your Asterisk server",
          });
        })
        .catch((error) => {
          console.error("Failed to reload Asterisk configuration:", error);
          // Don't show an error toast since this is optional
        });
    } catch (error: any) {
      console.error("Error generating config:", error);
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Server className="h-5 w-5 mr-2" />
          Asterisk Configuration Generator
        </CardTitle>
        <CardDescription>
          Generate Asterisk configuration using your existing SIP providers, greeting files, and transfer numbers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Loading your resources...</span>
          </div>
        )}
        
        {isMissingResources && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing Resources</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>You need to set up the following resources before generating Asterisk configuration:</p>
              <ul className="list-disc pl-5 space-y-1">
                {activeProviders.length === 0 && <li>At least one active SIP provider</li>}
                {greetingFiles.length === 0 && <li>At least one greeting file</li>}
                {transferNumbers.length === 0 && <li>At least one transfer number</li>}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {isReady && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">SIP Provider</Label>
                <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select a SIP provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProviders.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name} ({provider.host})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="greeting">Greeting File</Label>
                <Select value={selectedGreetingId} onValueChange={setSelectedGreetingId}>
                  <SelectTrigger id="greeting">
                    <SelectValue placeholder="Select a greeting file" />
                  </SelectTrigger>
                  <SelectContent>
                    {greetingFiles.map(file => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.filename}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer">Transfer Number</Label>
                <Select value={selectedTransferId} onValueChange={setSelectedTransferId}>
                  <SelectTrigger id="transfer">
                    <SelectValue placeholder="Select a transfer number" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferNumbers.map(number => (
                      <SelectItem key={number.id} value={number.id}>
                        {number.name}: {number.number || number.phone_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <GenerateConfigButton 
              onGenerate={generateConfig}
              isGenerating={isGenerating}
            />
            
            <ConfigOutput configOutput={configOutput} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SipConfigurationContainer;
