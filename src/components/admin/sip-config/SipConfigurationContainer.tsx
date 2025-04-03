import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { asteriskService } from "@/utils/asteriskService";
import { asteriskConfig } from "@/utils/asterisk/configGenerators";
import { useGreetingFiles } from "@/hooks/useGreetingFiles";
import { useTransferNumbers } from "@/hooks/useTransferNumbers";
import { useSipProviders } from "@/hooks/useSipProviders";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Loader2, Server } from "lucide-react";
import { ConfigOutput } from "./components/ConfigOutput";
import { GenerateConfigButton } from "./components/GenerateConfigButton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const SipConfigurationContainer = () => {
  const { user } = useAuth();
  const { greetingFiles, isLoading: isLoadingGreetingFiles } = useGreetingFiles();
  const { transferNumbers, isLoading: isLoadingTransferNumbers } = useTransferNumbers();
  const { providers, isLoading: isLoadingProviders } = useSipProviders();
  const { campaigns, isLoading: isLoadingCampaigns } = useCampaigns();
  
  const [configOutput, setConfigOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filter for active providers only
  const activeProviders = providers.filter(p => p.isActive);
  
  // Auto-generate config when resources are loaded
  useEffect(() => {
    if (!isLoadingGreetingFiles && !isLoadingTransferNumbers && !isLoadingProviders && !isLoadingCampaigns) {
      if (activeProviders.length > 0 && greetingFiles.length > 0 && transferNumbers.length > 0) {
        generateConfig();
      }
    }
  }, [isLoadingGreetingFiles, isLoadingTransferNumbers, isLoadingProviders, isLoadingCampaigns]);
  
  const isLoading = isLoadingProviders || isLoadingGreetingFiles || isLoadingTransferNumbers || isLoadingCampaigns;
  const isReady = !isLoading && activeProviders.length > 0 && greetingFiles.length > 0 && transferNumbers.length > 0;
  const isMissingResources = !isLoading && 
    (activeProviders.length === 0 || greetingFiles.length === 0 || transferNumbers.length === 0);
  
  const generateConfig = () => {
    setIsGenerating(true);
    
    try {
      let configText = "";
      
      // If we have campaigns, generate configurations for all of them
      if (campaigns && campaigns.length > 0) {
        configText = asteriskConfig.generateAllCampaignsConfig(
          campaigns,
          activeProviders,
          greetingFiles,
          transferNumbers
        );
      } else {
        // Otherwise, generate a default configuration
        configText = asteriskConfig.generateAutoConfig(
          activeProviders,
          greetingFiles,
          transferNumbers
        );
      }
      
      if (!configText) {
        throw new Error("Could not generate configuration with available resources");
      }
      
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
          Automatically generates Asterisk configuration for all your campaigns using your existing resources
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
            <p className="text-muted-foreground">
              {campaigns && campaigns.length > 0 
                ? `Automatically generating configuration for ${campaigns.length} campaign(s) using your resources:`
                : "Using your available resources to generate configuration:"}
            </p>
            
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><strong>SIP Providers:</strong> {activeProviders.length} active provider(s)</li>
              <li><strong>Greeting Files:</strong> {greetingFiles.length} file(s) available</li>
              <li><strong>Transfer Numbers:</strong> {transferNumbers.length} number(s) available</li>
              <li><strong>Campaigns:</strong> {campaigns?.length || 0} configured</li>
            </ul>
            
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
