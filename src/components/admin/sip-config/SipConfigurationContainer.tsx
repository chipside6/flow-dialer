
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
import { Loader2, Server, Download } from "lucide-react";
import { ConfigOutput } from "./components/ConfigOutput";
import { GenerateConfigButton } from "./components/GenerateConfigButton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SipConfigurationContainer = () => {
  const { user } = useAuth();
  const { greetingFiles, isLoading: isLoadingGreetingFiles } = useGreetingFiles();
  const { transferNumbers, isLoading: isLoadingTransferNumbers } = useTransferNumbers();
  const { providers, isLoading: isLoadingProviders } = useSipProviders();
  const { campaigns, isLoading: isLoadingCampaigns } = useCampaigns();
  
  const [configOutput, setConfigOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("auto");
  const [userId, setUserId] = useState("");
  const [campaignId, setcampaignId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [greetingId, setGreetingId] = useState("");
  const [transferId, setTransferId] = useState("");
  
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

  const generateUserSpecificConfig = () => {
    setIsGenerating(true);
    
    try {
      // Simulate an API call for this example
      // In a real implementation, this would call your backend API
      const simulateApiFetch = async (url: string) => {
        console.log(`API call to: ${url}`);
        
        // For demo purposes, we'll create a dummy response
        // In production, this would be replaced with an actual API call
        const dummyResponse = {
          config: `
; Asterisk Configuration for User ID: ${userId || 'all'}
; Campaign ID: ${campaignId || 'default'}
; ----------------------------------------------
; 
; This is a dynamically generated configuration based on specified parameters.
; In a real implementation, this would be fetched from your backend API
; which would query your database for the user's actual resources.
;
; To implement this in production:
; 1. Create a backend API endpoint that accepts userId and campaignId
; 2. The endpoint should query your database for the user's resources
; 3. Use the asteriskConfig methods to generate the actual configuration
; 4. Return the generated configuration as a response
;
; SIP Provider Configuration
; --------------------------
[user-${userId}-provider]
type=peer
host=sip.example.com
port=5060
username=user${userId}
secret=password123
fromuser=user${userId}
context=from-trunk
disallow=all
allow=ulaw
allow=alaw
dtmfmode=rfc2833
insecure=port,invite
nat=force_rport,comedia
qualify=yes
directmedia=no
rtp_timeout=30
transport=udp

; Dialplan Configuration
; ---------------------
[campaign-${campaignId || 'default'}]
; Answer the call
exten => s,1,Answer()
; Wait for the audio channel to be ready
exten => s,n,Wait(1)
; Play greeting message
exten => s,n,Playback(custom-greeting-file)
; Wait for keypress (5 seconds)
exten => s,n,WaitExten(5)
; If no keypress, hang up
exten => s,n,Hangup()

; Handle keypress 1 for transfer to agent
exten => 1,1,NoOp(Transferring call to transfer-number)
exten => 1,n,Dial(SIP/transfer-number,30,g)
exten => 1,n,Hangup()
          `.trim()
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return dummyResponse;
      };

      // Generate the API parameters
      const params = {
        user_id: userId,
        campaign_id: campaignId,
        provider_id: providerId,
        greeting_id: greetingId,
        transfer_id: transferId
      };
      
      // Generate configuration using the API method
      asteriskConfig.generateConfigFromApi(params)(simulateApiFetch)
        .then(configText => {
          setConfigOutput(configText);
          
          toast({
            title: "Configuration Generated",
            description: "User-specific Asterisk configuration has been generated successfully",
          });
        })
        .catch(error => {
          console.error("Error generating user-specific config:", error);
          toast({
            title: "Generation Error",
            description: `Failed to generate configuration: ${error.message}`,
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsGenerating(false);
        });
      
    } catch (error: any) {
      console.error("Error generating user config:", error);
      toast({
        title: "Generation Error",
        description: `Failed to generate configuration: ${error.message}`,
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  const handleDownloadConfig = () => {
    if (!configOutput) {
      toast({
        title: "No Configuration",
        description: "Please generate configuration first before downloading",
        variant: "destructive"
      });
      return;
    }

    // Create a blob with the configuration text
    const blob = new Blob([configOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asterisk-config.conf';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration Downloaded",
      description: "Asterisk configuration has been downloaded as a file",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Server className="h-5 w-5 mr-2" />
          Asterisk Configuration Generator
        </CardTitle>
        <CardDescription>
          Automatically generates Asterisk configuration based on user data and campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Loading resources...</span>
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
        
        {!isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="auto">Automatic Config</TabsTrigger>
              <TabsTrigger value="user">User/Campaign Specific</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auto" className="space-y-4">
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
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="user" className="space-y-4">
              <div className="space-y-4">
                <Alert variant="default">
                  <AlertTitle>Generate Configuration for Specific User/Campaign</AlertTitle>
                  <AlertDescription>
                    Enter user ID and/or campaign ID to generate configuration for specific users and campaigns.
                    This is useful for integrating with external systems and automating configuration generation.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input 
                      id="userId" 
                      value={userId} 
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter user ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="campaignId">Campaign ID</Label>
                    <Input 
                      id="campaignId" 
                      value={campaignId} 
                      onChange={(e) => setcampaignId(e.target.value)}
                      placeholder="Enter campaign ID (optional)"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="providerId">Provider ID (optional)</Label>
                    <Input 
                      id="providerId" 
                      value={providerId} 
                      onChange={(e) => setProviderId(e.target.value)}
                      placeholder="SIP provider ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="greetingId">Greeting ID (optional)</Label>
                    <Input 
                      id="greetingId" 
                      value={greetingId} 
                      onChange={(e) => setGreetingId(e.target.value)}
                      placeholder="Greeting file ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transferId">Transfer ID (optional)</Label>
                    <Input 
                      id="transferId" 
                      value={transferId} 
                      onChange={(e) => setTransferId(e.target.value)}
                      placeholder="Transfer number ID"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={generateUserSpecificConfig}
                  disabled={!userId || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Configuration'
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {configOutput && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadConfig}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Config
              </Button>
            </div>
            
            <ConfigOutput configOutput={configOutput} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SipConfigurationContainer;
