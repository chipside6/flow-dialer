
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle2, Loader2, Save, TestTube } from "lucide-react";
import { asteriskService, ASTERISK_API_URL, ASTERISK_API_USERNAME, ASTERISK_API_PASSWORD } from "@/utils/asteriskService";

const SipConfiguration = () => {
  const [apiUrl, setApiUrl] = useState(ASTERISK_API_URL);
  const [username, setUsername] = useState(ASTERISK_API_USERNAME);
  const [password, setPassword] = useState(ASTERISK_API_PASSWORD);
  const [providerName, setProviderName] = useState("my-sip-provider");
  const [host, setHost] = useState("sip.provider.com");
  const [port, setPort] = useState("5060");
  const [providerUsername, setProviderUsername] = useState("sipuser");
  const [providerPassword, setProviderPassword] = useState("sippassword");
  const [configOutput, setConfigOutput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"untested" | "success" | "error">("untested");

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus("untested");
    
    try {
      // First save the current values to localStorage for persistence
      localStorage.setItem("asterisk_api_url", apiUrl);
      localStorage.setItem("asterisk_api_username", username);
      localStorage.setItem("asterisk_api_password", password);
      
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
      const sipConfig = asteriskService.generateSipTrunkConfig(
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
    navigator.clipboard.writeText(configOutput);
    toast({
      title: "Copied to Clipboard",
      description: "Configuration has been copied to clipboard",
    });
  };

  const saveSettings = () => {
    // Save to localStorage for persistence across sessions
    localStorage.setItem("asterisk_api_url", apiUrl);
    localStorage.setItem("asterisk_api_username", username);
    localStorage.setItem("asterisk_api_password", password);
    
    toast({
      title: "Settings Saved",
      description: "Asterisk API settings have been saved. These will be used for this session, but you should set environment variables for production.",
    });
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
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              onClick={testConnection} 
              disabled={isTesting}
              className="flex items-center gap-2"
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
              className="flex items-center gap-2"
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="5060"
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
              />
            </div>
          </div>
          
          <Button 
            onClick={generateConfig} 
            disabled={isGenerating}
            className="flex items-center gap-2"
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
                className="font-mono text-sm"
              />
              <Button variant="outline" onClick={copyToClipboard}>
                Copy to Clipboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SipConfiguration;
