
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { asteriskService } from "@/utils/asteriskService";
import { userGenerator } from "@/utils/asterisk/generators/userGenerator";
import { ConfigOutput } from "./components/ConfigOutput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUPABASE_CONFIG } from "@/config/productionConfig";
import { ConfigurationHeader } from "./components/ConfigurationHeader";
import { InstallationAlert } from "./components/InstallationAlert";
import { SupabaseInfoAlert } from "./components/SupabaseInfoAlert";
import { ConfigurationFeatures } from "./components/ConfigurationFeatures";
import { InstructionsContent } from "./components/InstructionsContent";
import { DownloadButton } from "./components/DownloadButton";
import { GenerateConfigButton } from "./components/GenerateConfigButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Copy } from "lucide-react";

const SipConfigurationContainer = () => {
  const { user } = useAuth();
  
  const [configOutput, setConfigOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("master");
  const [verificationCommands, setVerificationCommands] = useState(false);

  // Get the Supabase URL and anon key from config
  const supabaseUrl = SUPABASE_CONFIG.url;
  const supabaseKey = SUPABASE_CONFIG.publicKey;
  
  // Generate the master configuration for all users
  const generateMasterConfig = () => {
    setIsGenerating(true);
    
    try {
      // Pass the Supabase key directly - never use a placeholder
      const masterConfig = userGenerator.generateMasterServerConfig(supabaseUrl, supabaseKey);
      
      setConfigOutput(masterConfig);
      setVerificationCommands(true);
      
      toast({
        title: "Supabase Master Configuration Generated",
        description: "Asterisk configuration for Supabase has been generated successfully",
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

  const copyVerificationCommands = () => {
    const commands = `# Save the config to file
sudo nano /etc/asterisk/campaign-master.conf
# Paste the generated config and save (Ctrl+O, Enter, Ctrl+X)

# Include the file in extensions.conf
echo '#include "campaign-master.conf"' | sudo tee -a /etc/asterisk/extensions.conf

# Create directory for dynamic SIP trunks
sudo mkdir -p /etc/asterisk/dynamic_sip_trunks

# Install required tools
sudo apt-get install -y jq curl

# Reload the dialplan
sudo asterisk -rx "dialplan reload"

# Verify installation
sudo asterisk -rx "dialplan show user-campaign-router"`;

    navigator.clipboard.writeText(commands);
    toast({
      title: "Commands Copied",
      description: "Installation verification commands copied to clipboard"
    });
  };

  return (
    <Card>
      <ConfigurationHeader />
      <CardContent className="space-y-4">
        <InstallationAlert />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="master">Master Configuration</TabsTrigger>
            <TabsTrigger value="instructions">Installation Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="master" className="space-y-4">
            <SupabaseInfoAlert supabaseUrl={supabaseUrl} />
            
            <ConfigurationFeatures />
            
            <GenerateConfigButton 
              onGenerate={generateMasterConfig}
              isGenerating={isGenerating}
            />
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-4">
            <InstructionsContent />
          </TabsContent>
        </Tabs>
        
        {configOutput && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <DownloadButton configOutput={configOutput} />
            </div>
            
            <ConfigOutput configOutput={configOutput} />

            {verificationCommands && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Verification Instructions</AlertTitle>
                <AlertDescription className="text-amber-700">
                  <p className="mb-2">After downloading the configuration, follow these steps to install and verify it:</p>
                  <ol className="list-decimal pl-5 space-y-1 mb-3">
                    <li>Save the config to <code className="bg-amber-100 px-1 rounded">/etc/asterisk/campaign-master.conf</code></li>
                    <li>Add <code className="bg-amber-100 px-1 rounded">#include "campaign-master.conf"</code> to your <code className="bg-amber-100 px-1 rounded">/etc/asterisk/extensions.conf</code></li>
                    <li>Create directory: <code className="bg-amber-100 px-1 rounded">mkdir -p /etc/asterisk/dynamic_sip_trunks</code></li>
                    <li>Install required tools: <code className="bg-amber-100 px-1 rounded">apt-get install jq curl</code></li>
                    <li>Reload the dialplan: <code className="bg-amber-100 px-1 rounded">asterisk -rx "dialplan reload"</code></li>
                    <li>Verify installation: <code className="bg-amber-100 px-1 rounded">asterisk -rx "dialplan show user-campaign-router"</code></li>
                  </ol>
                  <button
                    onClick={copyVerificationCommands}
                    className="flex items-center gap-1 text-sm bg-amber-200 hover:bg-amber-300 text-amber-900 px-3 py-1.5 rounded transition-colors"
                  >
                    <Copy className="h-4 w-4" /> Copy All Commands
                  </button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SipConfigurationContainer;
