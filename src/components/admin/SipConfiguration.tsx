import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle2, Loader2, Save, TestTube, AlertTriangle, Copy, Clipboard } from "lucide-react";
import { asteriskService, asteriskConfig } from "@/utils/asteriskService";

const SipConfiguration = () => {
  // Initialize state from either env variables or localStorage for development purposes
  const [apiUrl, setApiUrl] = useState(
    import.meta.env.VITE_ASTERISK_API_URL || 
    localStorage.getItem("asterisk_api_url") || 
    "http://your-asterisk-server:8088/ari"
  );
  const [username, setUsername] = useState(
    import.meta.env.VITE_ASTERISK_API_USERNAME || 
    localStorage.getItem("asterisk_api_username") || 
    "asterisk"
  );
  const [password, setPassword] = useState(
    import.meta.env.VITE_ASTERISK_API_PASSWORD || 
    localStorage.getItem("asterisk_api_password") || 
    "asterisk"
  );
  const [providerName, setProviderName] = useState("my-sip-provider");
  const [host, setHost] = useState("sip.provider.com");
  const [port, setPort] = useState("5060");
  const [providerUsername, setProviderUsername] = useState("sipuser");
  const [providerPassword, setProviderPassword] = useState("sippassword");
  const [configOutput, setConfigOutput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"untested" | "success" | "error">("untested");
  const [showEnvHelp, setShowEnvHelp] = useState(false);
  const [copyingToClipboard, setCopyingToClipboard] = useState(false);
  const [copyingEnvVars, setCopyingEnvVars] = useState(false);

  // Load stored values from localStorage on component mount
  useEffect(() => {
    const storedApiUrl = localStorage.getItem("asterisk_api_url");
    const storedUsername = localStorage.getItem("asterisk_api_username");
    const storedPassword = localStorage.getItem("asterisk_api_password");
    
    if (storedApiUrl) setApiUrl(storedApiUrl);
    if (storedUsername) setUsername(storedUsername);
    if (storedPassword) setPassword(storedPassword);
  }, []);

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus("untested");
    
    try {
      // First save the current values to localStorage for persistence
      localStorage.setItem("asterisk_api_url", apiUrl);
      localStorage.setItem("asterisk_api_username", username);
      localStorage.setItem("asterisk_api_password", password);
      
      toast({
        title: "Testing Connection",
        description: "Attempting to connect to Asterisk server..."
      });
      
      // Create temporary override of the service values
      const tempService = {
        ...asteriskService,
        testConnection: async () => {
          try {
            const basicAuth = btoa(`${username}:${password}`);
            const response = await fetch(`${apiUrl}/applications`, {
              headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
              },
              signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            
            if (!response.ok) {
              throw new Error(`Server responded with status: ${response.status}`);
            }
            
            return {
              success: true,
              message: "Successfully connected to Asterisk server"
            };
          } catch (error) {
            return {
              success: false,
              message: `Failed to connect: ${error.message}`
            };
          }
        }
      };
      
      const result = await tempService.testConnection();
      
      if (result.success) {
        setConnectionStatus("success");
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Asterisk server",
        });
      } else {
        setConnectionStatus("error");
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus("error");
      toast({
        title: "Connection Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const generateConfig = () => {
    setIsGenerating(true);
    
    try {
      const sipConfig = asteriskConfig.generateSipTrunkConfig(
        providerName,
        host,
        port,
        providerUsername,
        providerPassword
      );
      
      // Generate a basic dialplan
      const dialplan = `
[from-${providerName}]
exten => _X.,1,NoOp(Incoming call from ${providerName})
exten => _X.,n,Answer()
exten => _X.,n,Wait(1)
exten => _X.,n,Playback(hello-world)
exten => _X.,n,Hangup()

[outbound-${providerName}]
exten => _X.,1,NoOp(Outbound call via ${providerName})
exten => _X.,n,Dial(SIP/\${EXTEN}@${providerName},30,g)
exten => _X.,n,Hangup()
      `.trim();
      
      setConfigOutput(`; SIP Provider Configuration\n${sipConfig}\n\n; Dialplan Configuration\n${dialplan}`);
      
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

  const copyToClipboard = () => {
    setCopyingToClipboard(true);
    
    try {
      navigator.clipboard.writeText(configOutput);
      toast({
        title: "Copied to Clipboard",
        description: "Configuration has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: `Could not copy to clipboard: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setCopyingToClipboard(false), 1000);
    }
  };

  const saveSettings = () => {
    // Save to localStorage for persistence across sessions
    localStorage.setItem("asterisk_api_url", apiUrl);
    localStorage.setItem("asterisk_api_username", username);
    localStorage.setItem("asterisk_api_password", password);
    
    toast({
      title: "Settings Saved",
      description: "Asterisk API settings have been saved locally. For production use, set these as environment variables.",
    });
    
    setShowEnvHelp(true);
  };

  const copyEnvVars = () => {
    setCopyingEnvVars(true);
    
    try {
      const envVarText = `
VITE_ASTERISK_API_URL=${apiUrl}
VITE_ASTERISK_API_USERNAME=${username}
VITE_ASTERISK_API_PASSWORD=${password}
`.trim();

      navigator.clipboard.writeText(envVarText);
      toast({
        title: "Environment Variables Copied",
        description: "Environment variables have been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: `Could not copy environment variables: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setCopyingEnvVars(false), 1000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asterisk API Configuration</CardTitle>
          <CardDescription>
            Configure your Asterisk REST Interface (ARI) connection settings.
            For production, these should be set as environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">API URL</Label>
            <Input
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://your-asterisk-server:8088/ari"
              className="focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="asterisk"
                className="focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="asterisk"
                className="focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              onClick={testConnection} 
              disabled={isTesting}
              className="flex items-center gap-2 active:scale-95 transition-transform"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Test Connection
            </Button>
            
            <Button 
              variant="outline" 
              onClick={saveSettings}
              className="flex items-center gap-2 active:scale-95 transition-transform"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
            
            {connectionStatus === "success" && (
              <div className="ml-auto flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Connection successful</span>
              </div>
            )}
          </div>
          
          {showEnvHelp && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">For Production Use</h4>
                  <p className="text-sm text-amber-700">
                    The settings have been saved to your browser storage for development,
                    but for production use, you should set the following environment variables:
                  </p>
                </div>
              </div>
              <div className="font-mono text-sm bg-gray-800 text-white p-2 rounded mt-2">
                <pre className="whitespace-pre-wrap">
                  VITE_ASTERISK_API_URL={apiUrl}<br/>
                  VITE_ASTERISK_API_USERNAME={username}<br/>
                  VITE_ASTERISK_API_PASSWORD=********
                </pre>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyEnvVars}
                className="mt-2 active:scale-95 transition-transform"
                disabled={copyingEnvVars}
              >
                {copyingEnvVars ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <Clipboard className="h-4 w-4 mr-2" />
                )}
                {copyingEnvVars ? "Copied!" : "Copy Environment Variables"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>SIP Provider Configuration Generator</CardTitle>
          <CardDescription>
            Generate Asterisk configuration for your SIP provider.
            This will create SIP trunk and basic dialplan configurations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider-name">Provider Name</Label>
            <Input
              id="provider-name"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="my-sip-provider"
              className="focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host/Server</Label>
              <Input
                id="host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="sip.provider.com"
                className="focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="5060"
                className="focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider-username">Username/Account ID</Label>
              <Input
                id="provider-username"
                value={providerUsername}
                onChange={(e) => setProviderUsername(e.target.value)}
                placeholder="sipuser"
                className="focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider-password">Password/API Key</Label>
              <Input
                id="provider-password"
                type="password"
                value={providerPassword}
                onChange={(e) => setProviderPassword(e.target.value)}
                placeholder="sippassword"
                className="focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <Button 
            onClick={generateConfig} 
            disabled={isGenerating}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            Generate Configuration
          </Button>
          
          {configOutput && (
            <div className="space-y-2 pt-4">
              <Label htmlFor="config-output">Configuration Output</Label>
              <Textarea
                id="config-output"
                value={configOutput}
                readOnly
                rows={15}
                className="font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                className="active:scale-95 transition-transform"
                disabled={copyingToClipboard}
              >
                {copyingToClipboard ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copyingToClipboard ? "Copied!" : "Copy to Clipboard"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SipConfiguration;
