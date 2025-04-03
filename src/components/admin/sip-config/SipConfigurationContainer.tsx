
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { asteriskService } from "@/utils/asteriskService";
import { userGenerator } from "@/utils/asterisk/generators/userGenerator";
import { Loader2, Server, Download } from "lucide-react";
import { ConfigOutput } from "./components/ConfigOutput";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const SipConfigurationContainer = () => {
  const { user } = useAuth();
  
  const [configOutput, setConfigOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("master");

  // Get the Supabase URL and anon key from the client
  const supabaseUrl = supabase.supabaseUrl;
  const supabaseKey = supabase.supabaseKey;
  
  // Generate the master configuration for all users
  const generateMasterConfig = () => {
    setIsGenerating(true);
    
    try {
      // Generate a token if one doesn't exist
      const token = supabaseKey;
      
      // Generate the master configuration with Supabase settings
      const masterConfig = userGenerator.generateMasterServerConfig(supabaseUrl, token);
      
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

  // Handle download of configuration
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
    a.download = 'asterisk-master-config.conf';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration Downloaded",
      description: "Asterisk master configuration has been downloaded as a file",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Server className="h-5 w-5 mr-2" />
          Asterisk Master Configuration Generator
        </CardTitle>
        <CardDescription>
          Generates a universal Asterisk configuration that can be installed once on your server
          to automatically handle all users and campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default">
          <AlertTitle>One-Time Installation Required</AlertTitle>
          <AlertDescription>
            This master configuration only needs to be installed <strong>once</strong> on your Asterisk server. 
            After installation, your server will automatically fetch user and campaign configurations from your Supabase API
            without requiring manual updates for each campaign.
          </AlertDescription>
        </Alert>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="master">Master Configuration</TabsTrigger>
            <TabsTrigger value="instructions">Installation Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="master" className="space-y-4">
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Supabase Integration</AlertTitle>
              <AlertDescription className="text-blue-700">
                The master configuration uses your Supabase URL: <strong>{supabaseUrl}</strong> and the anonymous API key 
                to connect to your Supabase backend. No additional configuration is needed.
              </AlertDescription>
            </Alert>
            
            <p className="text-muted-foreground">
              This master configuration creates a complete Asterisk setup that will:
            </p>
            
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Automatically fetch user campaigns from your Supabase API</li>
              <li>Handle dynamic routing for all users' campaigns</li>
              <li>Support SIP trunks for all configured providers</li>
              <li>Manage call transfers and IVR menus</li>
              <li>Clean up temporary files and maintain system health</li>
            </ul>
            
            <Button
              onClick={generateMasterConfig}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Master Configuration'
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-4">
            <Alert variant="default">
              <AlertTitle>Installation Instructions</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Generate the master configuration using the button on the "Master Configuration" tab</li>
                  <li>Copy the generated configuration or download it as a file</li>
                  <li>On your Asterisk server, save the configuration to <code>/etc/asterisk/extensions.conf</code> (or include it in your existing file)</li>
                  <li>Reload the dialplan with: <code>asterisk -rx "dialplan reload"</code></li>
                  <li>User campaigns will now automatically work without additional configuration</li>
                </ol>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        
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
