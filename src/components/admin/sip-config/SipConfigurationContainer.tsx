
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

const SipConfigurationContainer = () => {
  const { user } = useAuth();
  
  const [configOutput, setConfigOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("master");

  // Get the backend URL from window.location or use a default
  const defaultApiUrl = (() => {
    // If we're running on localhost, assume backend is on port 8000
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return `http://${window.location.hostname}:8000`;
    }
    // Otherwise use the same domain but ensure we target /api
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return baseUrl;
  })();

  // State for API server and token
  const [apiServerUrl, setApiServerUrl] = useState(defaultApiUrl);
  const [apiToken, setApiToken] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  
  // Generate the master configuration for all users
  const generateMasterConfig = () => {
    setIsGenerating(true);
    
    try {
      // Generate a token if one doesn't exist
      const token = apiToken || userGenerator.generateSecureToken();
      if (!apiToken) {
        setApiToken(token);
        setGeneratedToken(token);
      }
      
      // Generate the master configuration with API settings
      const masterConfig = userGenerator.generateMasterServerConfig(apiServerUrl, token);
      
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

  // Generate a secure token to use with the API
  const generateToken = () => {
    const token = userGenerator.generateSecureToken();
    setApiToken(token);
    setGeneratedToken(token);
    
    toast({
      title: "Secure Token Generated",
      description: "A new secure token has been generated for your API"
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
            After installation, your server will automatically fetch user and campaign configurations from your API
            without requiring manual updates for each campaign.
          </AlertDescription>
        </Alert>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="master">Master Configuration</TabsTrigger>
            <TabsTrigger value="api-settings">API Settings</TabsTrigger>
            <TabsTrigger value="instructions">Installation Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="master" className="space-y-4">
            <p className="text-muted-foreground">
              This master configuration creates a complete Asterisk setup that will:
            </p>
            
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Automatically fetch user campaigns from your API</li>
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

          <TabsContent value="api-settings" className="space-y-4">
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Backend API Configuration</AlertTitle>
              <AlertDescription className="text-blue-700">
                These settings configure how Asterisk connects to your application's backend API.
                This is <strong>not</strong> related to Supabase - it's your own backend API that serves campaign configurations.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-server">Backend API URL</Label>
                <Input
                  id="api-server"
                  value={apiServerUrl}
                  onChange={(e) => setApiServerUrl(e.target.value)}
                  placeholder="http://yourdomain.com or http://localhost:8000"
                />
                <p className="text-xs text-muted-foreground">
                  The URL where your backend API is hosted. This is where Asterisk will request campaign configurations.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-token">API Security Token</Label>
                <div className="flex space-x-2">
                  <Input
                    id="api-token"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="Enter or generate a secure token"
                    type="text"
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={generateToken}
                    type="button"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  A secure token that your API server will validate to ensure requests are authorized.
                  {generatedToken && <span className="block mt-1 font-medium text-primary"> Token generated! Remember to save this value in your backend configuration.</span>}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-4">
            <Alert variant="default">
              <AlertTitle>Installation Instructions</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Configure your Backend API URL and Security Token in the "API Settings" tab</li>
                  <li>Generate the master configuration using the button on the "Master Configuration" tab</li>
                  <li>Copy the generated configuration or download it as a file</li>
                  <li>On your Asterisk server, save the configuration to <code>/etc/asterisk/extensions.conf</code> (or include it in your existing file)</li>
                  <li>Reload the dialplan with: <code>asterisk -rx "dialplan reload"</code></li>
                  <li>Configure your backend API (Node.js server) to validate the security token and serve campaign configurations</li>
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
