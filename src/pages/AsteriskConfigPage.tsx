
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import EnvironmentSetup from "@/components/admin/sip-config/EnvironmentSetup";
import { AsteriskGuide } from "@/components/goip/AsteriskGuide";
import { SetupInstructions } from "@/components/goip/SetupInstructions";
import { AsteriskConfigDisplay } from "@/components/dialer/AsteriskConfigDisplay"; 
import { masterConfigGenerator } from "@/utils/asterisk/generators/masterConfigGenerator";
import { 
  ASTERISK_API_URL, 
  ASTERISK_API_USERNAME, 
  ASTERISK_API_PASSWORD,
  getConfigFromStorage,
  saveConfigToStorage
} from "@/utils/asterisk/config";
import { Download, Server, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const AsteriskConfigPage = () => {
  const { user, isAdmin } = useAuth();
  const [apiUrl, setApiUrl] = useState(ASTERISK_API_URL);
  const [username, setUsername] = useState(ASTERISK_API_USERNAME);
  const [password, setPassword] = useState(ASTERISK_API_PASSWORD);
  const [activeTab, setActiveTab] = useState("setup-instructions");
  const [configPassword, setConfigPassword] = useState("");
  const { toast } = useToast();
  
  // Generate random password for Asterisk configuration if not already set
  useEffect(() => {
    if (!configPassword) {
      const randomPass = Math.random().toString(36).substring(2, 10) + 
                         Math.random().toString(36).substring(2, 10);
      setConfigPassword(randomPass);
    }
  }, [configPassword]);
  
  // Load saved configuration on initial render
  useEffect(() => {
    const savedConfig = getConfigFromStorage();
    
    if (savedConfig.apiUrl && apiUrl !== savedConfig.apiUrl) {
      setApiUrl(savedConfig.apiUrl);
    }
    
    if (savedConfig.username && username !== savedConfig.username) {
      setUsername(savedConfig.username);
    }
    
    if (savedConfig.password && password !== savedConfig.password) {
      setPassword(savedConfig.password);
    }
  }, []);

  // Save configurations
  const handleSaveConfig = () => {
    saveConfigToStorage({
      apiUrl,
      username,
      password
    });
    
    toast({
      title: "Configuration saved",
      description: "Your Asterisk server configuration has been saved."
    });
  };

  // Download master configuration
  const handleDownloadMasterConfig = () => {
    const masterConfig = masterConfigGenerator.generateMasterConfig();
    const blob = new Blob([masterConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'asterisk-campaign-master.conf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Configuration downloaded",
      description: "Save this file to your Asterisk server and follow the instructions within."
    });
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Asterisk Server Configuration</h1>
            <p className="text-muted-foreground">
              Configure and manage your Asterisk server for the autodialer system
            </p>
          </div>
        </div>
        
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            You need to set up an Asterisk server to use the autodialer features. Follow the instructions below to configure your server.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="setup-instructions">Setup Instructions</TabsTrigger>
            <TabsTrigger value="configuration">Server Configuration</TabsTrigger>
            <TabsTrigger value="technical-guide">Technical Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup-instructions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Asterisk Server Setup
                </CardTitle>
                <CardDescription>
                  Step-by-step instructions to set up your Asterisk server
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Option 1: Use Our Master Configuration (Recommended)</h3>
                  <p className="text-sm text-muted-foreground">
                    For a quick setup, download our master configuration file and follow the installation instructions inside.
                  </p>
                  <Button onClick={handleDownloadMasterConfig}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Master Configuration
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Option 2: Manual Configuration</h3>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Step 1: Install Asterisk</h4>
                    <ScrollArea className="h-[100px] w-full rounded-md border p-4 bg-muted">
                      <pre className="text-xs">
{`sudo apt update
sudo apt install -y asterisk
# Install supporting packages
sudo apt install -y jq curl python3 python3-pip
pip3 install asterisk-agi`}
                      </pre>
                    </ScrollArea>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Step 2: Configure Asterisk Files</h4>
                    <p className="text-sm text-muted-foreground">
                      Create the necessary configuration files on the "Server Configuration" tab
                    </p>
                    <Button onClick={() => setActiveTab("configuration")} variant="outline">
                      Go to Server Configuration
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Step 3: Configure Your GoIP Device</h4>
                    <p className="text-sm text-muted-foreground">
                      Register your GoIP device with the credentials from the GoIP Setup page
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = '/goip-setup'}>
                      Go to GoIP Setup
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Step 4: Verify Your Configuration</h4>
                    <ScrollArea className="h-[80px] w-full rounded-md border p-4 bg-muted">
                      <pre className="text-xs">
{`# Verify Asterisk is running
sudo systemctl status asterisk

# Reload configuration
sudo asterisk -rx "dialplan reload"
sudo asterisk -rx "sip reload"`}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Once configured, your Asterisk server will automatically handle all campaigns
                </div>
              </CardFooter>
            </Card>
            
            <SetupInstructions />
          </TabsContent>
          
          <TabsContent value="configuration" className="space-y-6">
            <EnvironmentSetup
              apiUrl={apiUrl}
              username={username}
              password={password}
              setApiUrl={setApiUrl}
              setUsername={setUsername}
              setPassword={setPassword}
              onSave={handleSaveConfig}
            />
            
            <AsteriskConfigDisplay 
              username={`goip_${user?.id || 'user'}`}
              password={configPassword}
              host="0.0.0.0"
              port={5060}
            />
          </TabsContent>
          
          <TabsContent value="technical-guide">
            <AsteriskGuide />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AsteriskConfigPage;
