
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

const SipConfigurationContainer = () => {
  const { user } = useAuth();
  
  const [configOutput, setConfigOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("master");

  // Get the Supabase URL and anon key from config
  const supabaseUrl = SUPABASE_CONFIG.url;
  const supabaseKey = SUPABASE_CONFIG.publicKey;
  
  // Generate the master configuration for all users
  const generateMasterConfig = () => {
    setIsGenerating(true);
    
    try {
      // Generate the master configuration with Supabase settings
      const masterConfig = userGenerator.generateMasterServerConfig(supabaseUrl, supabaseKey);
      
      setConfigOutput(masterConfig);
      
      toast({
        title: "Master Configuration Generated",
        description: "Asterisk master configuration has been generated successfully",
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SipConfigurationContainer;
