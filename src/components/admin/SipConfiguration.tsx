import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { 
  CheckCircle2, 
  Loader2, 
  Save, 
  TestTube, 
  AlertTriangle, 
  Copy, 
  Clipboard, 
  FileCode2,
  Upload,
  Phone 
} from "lucide-react";
import { asteriskService, asteriskConfig } from "@/utils/asteriskService";

const SipConfiguration = () => {
  // Initialize state with env variables, fallback to empty strings for production
  const [apiUrl, setApiUrl] = useState(
    import.meta.env.VITE_ASTERISK_API_URL || ""
  );
  const [username, setUsername] = useState(
    import.meta.env.VITE_ASTERISK_API_USERNAME || ""
  );
  const [password, setPassword] = useState(
    import.meta.env.VITE_ASTERISK_API_PASSWORD || ""
  );
  const [providerName, setProviderName] = useState("my-sip-provider");
  const [host, setHost] = useState("sip.provider.com");
  const [port, setPort] = useState("5060");
  const [providerUsername, setProviderUsername] = useState("sipuser");
  const [providerPassword, setProviderPassword] = useState("sippassword");
  const [transferNumber, setTransferNumber] = useState("");
  const [greetingFile, setGreetingFile] = useState("greeting.wav");
  const [configOutput, setConfigOutput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"untested" | "success" | "error">("untested");
  const [copyingToClipboard, setCopyingToClipboard] = useState(false);
  const [copyingEnvVars, setCopyingEnvVars] = useState(false);
  const [fileInputRef] = useState<React.RefObject<HTMLInputElement>>(React.createRef());

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus("untested");
    
    try {
      toast({
        title: "Testing Connection",
        description: "Attempting to connect to Asterisk server..."
      });
      
      // Test connection with current values
      const result = await asteriskService.testConnection();
      
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
          description: result.message || "Failed to connect to Asterisk server",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's an audio file
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (wav, mp3)",
          variant: "destructive",
        });
        return;
      }
      
      setGreetingFile(file.name);
      
      toast({
        title: "Audio file selected",
        description: `File "${file.name}" will be used as the greeting`,
      });
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
      
      // Generate a dialplan that includes transfer number and greeting file
      const dialplan = `
[from-${providerName}]
exten => _X.,1,NoOp(Incoming call from ${providerName})
exten => _X.,n,Answer()
exten => _X.,n,Wait(1)
exten => _X.,n,Playback(${greetingFile || 'hello-world'})
exten => _X.,n,WaitExten(5)
exten => _X.,n,Hangup()

; Handle keypress 1 for transfer
exten => 1,1,NoOp(Transferring call to ${transferNumber || ''})
exten => 1,n,Dial(SIP/${transferNumber || ''},30)
exten => 1,n,Hangup()

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

  const copyToClipboard = (text: string, successMessage: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: successMessage,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: `Could not copy to clipboard: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleCopyConfig = () => {
    setCopyingToClipboard(true);
    copyToClipboard(configOutput, "Configuration has been copied to clipboard");
    setTimeout(() => setCopyingToClipboard(false), 1000);
  };

  const copyEnvVars = () => {
    setCopyingEnvVars(true);
    
    const envVarText = `
VITE_ASTERISK_API_URL=${apiUrl}
VITE_ASTERISK_API_USERNAME=${username}
VITE_ASTERISK_API_PASSWORD=${password}
`.trim();

    copyToClipboard(envVarText, "Environment variables have been copied to clipboard");
    setTimeout(() => setCopyingEnvVars(false), 1000);
  };

  const createEnvFile = () => {
    const envFileContent = `
# Asterisk Configuration
VITE_ASTERISK_API_URL=${apiUrl}
VITE_ASTERISK_API_USERNAME=${username}
VITE_ASTERISK_API_PASSWORD=${password}
`.trim();

    const blob = new Blob([envFileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `.env`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Environment File Created",
      description: "A .env file has been downloaded. Add this to your project root for development.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Production Environment Variables Setup</CardTitle>
          <CardDescription>
            For production use, Asterisk API settings should be set as environment variables.
            These variables are required for proper operation of the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Production Environment Variables</h4>
                <p className="text-sm text-amber-700 mb-2">
                  To use this application in production, you must set the following environment variables:
                </p>
                <div className="font-mono text-sm bg-gray-800 text-white p-3 rounded">
                  <pre className="whitespace-pre-wrap">
                    VITE_ASTERISK_API_URL=http://your-asterisk-server:8088/ari<br/>
                    VITE_ASTERISK_API_USERNAME=your_asterisk_username<br/>
                    VITE_ASTERISK_API_PASSWORD=your_asterisk_password
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyEnvVars}
                className="active:scale-95 transition-transform"
                disabled={copyingEnvVars}
              >
                {copyingEnvVars ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <Clipboard className="h-4 w-4 mr-2" />
                )}
                {copyingEnvVars ? "Copied!" : "Copy Current Values"}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={createEnvFile}
                className="active:scale-95 transition-transform"
              >
                <FileCode2 className="h-4 w-4 mr-2" />
                Download .env File
              </Button>
            </div>
          </div>
          
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
            
            {connectionStatus === "success" && (
              <div className="ml-auto flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Connection successful</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* New Card for Core Features */}
      <Card>
        <CardHeader>
          <CardTitle>Core Feature Configuration</CardTitle>
          <CardDescription>
            Set up the core features of your system: transfer numbers and greeting audio files.
            These settings will be used in the generated Asterisk configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transferNumber" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Transfer Number
              </Label>
              <Input
                id="transferNumber"
                value={transferNumber}
                onChange={(e) => setTransferNumber(e.target.value)}
                placeholder="e.g., +1 555-123-4567"
                className="focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="text-sm text-gray-500">
                This number will receive calls when the recipient presses 1 during the call
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="greetingFile" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Greeting Audio File
              </Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Input
                  id="greetingFile"
                  value={greetingFile}
                  onChange={(e) => setGreetingFile(e.target.value)}
                  placeholder="e.g., greeting.wav"
                  className="flex-1 focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                This audio file will be played when a call is received
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* SIP Provider Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>SIP Provider Configuration Generator</CardTitle>
          <CardDescription>
            Generate Asterisk configuration for your SIP provider, including the transfer number and greeting audio setup.
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
                onClick={handleCopyConfig}
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
