
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { 
  CheckCircle2, 
  Loader2, 
  TestTube, 
  AlertTriangle, 
  Clipboard, 
  FileCode2,
  Info
} from "lucide-react";
import { asteriskService } from "@/utils/asteriskService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  getConfigFromStorage, 
  saveConfigToStorage, 
  isHostedEnvironment 
} from "@/utils/asterisk/config";

interface EnvironmentSetupProps {
  apiUrl: string;
  username: string;
  password: string;
  setApiUrl: (url: string) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
}

const EnvironmentSetup: React.FC<EnvironmentSetupProps> = ({
  apiUrl,
  username,
  password,
  setApiUrl,
  setUsername,
  setPassword
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"untested" | "success" | "error">("untested");
  const [copyingEnvVars, setCopyingEnvVars] = useState(false);
  const isHosted = isHostedEnvironment();
  
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
  
  // Save configuration to localStorage when changed (if in hosted environment)
  useEffect(() => {
    if (isHosted && apiUrl && username && password) {
      saveConfigToStorage(apiUrl, username, password);
    }
  }, [apiUrl, username, password, isHosted]);

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus("untested");
    
    try {
      toast({
        title: "Testing Connection",
        description: "Attempting to connect to Asterisk server..."
      });
      
      // Save current values to localStorage (if in hosted environment)
      if (isHosted) {
        saveConfigToStorage(apiUrl, username, password);
      }
      
      // Test connection with current values - no manipulation of the URL
      const result = await asteriskService.testConnection({
        apiUrl, 
        username, 
        password
      });
      
      if (result.success) {
        setConnectionStatus("success");
        toast({
          title: "Connection Successful",
          description: result.message || "Successfully connected to Asterisk server",
        });
      } else {
        const isFatalError = !isHosted;
        setConnectionStatus(isFatalError ? "error" : "success");
        
        toast({
          title: isFatalError ? "Connection Failed" : "Configuration Accepted",
          description: isHosted 
            ? "Configuration saved despite connection issue (running in hosted environment)" 
            : result.message || "Failed to connect to Asterisk server",
          variant: isFatalError ? "destructive" : "default"
        });
      }
    } catch (error) {
      const isFatalError = !isHosted;
      setConnectionStatus(isFatalError ? "error" : "success");
      
      toast({
        title: isFatalError ? "Connection Error" : "Configuration Accepted",
        description: isHosted 
          ? "Configuration saved despite error (running in hosted environment)" 
          : `An unexpected error occurred: ${error.message}`,
        variant: isFatalError ? "destructive" : "default"
      });
    } finally {
      setIsTesting(false);
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
    <Card>
      <CardHeader>
        <CardTitle>Asterisk Environment Setup</CardTitle>
        <CardDescription>
          Configure your Asterisk server connection details below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isHosted && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Lovable Hosting Notice</AlertTitle>
            <AlertDescription className="text-blue-700">
              Since you're hosting on Lovable, these settings will be saved in your browser.
              The configuration will be accepted even if the connection test fails.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="api-url">API URL</Label>
          <Input
            id="api-url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="127.0.0.1:8088/ari"
            className="focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter the full URL with protocol if needed (e.g., http://127.0.0.1:8088/ari) or just the address (e.g., 127.0.0.1:8088/ari)
          </p>
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
        
        <div className="flex flex-wrap gap-2 pt-4">
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
          
          {!isHosted && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyEnvVars}
              className="ml-auto active:scale-95 transition-transform"
              disabled={copyingEnvVars}
            >
              {copyingEnvVars ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <Clipboard className="h-4 w-4 mr-2" />
              )}
              {copyingEnvVars ? "Copied!" : "Copy Values"}
            </Button>
          )}
          
          {connectionStatus === "success" && (
            <div className="ml-auto flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Configuration {isHosted ? "saved" : "successful"}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentSetup;
