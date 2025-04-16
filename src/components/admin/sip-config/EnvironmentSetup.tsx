
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { testAsteriskConnection, getConfigFromStorage, saveConfigToStorage } from "@/utils/asterisk/config";
import { useToast } from "@/components/ui/use-toast";
import { Settings, RefreshCw, AlertCircle, CheckCircle, Lock } from "lucide-react";

interface EnvironmentSetupProps {
  apiUrl: string;
  username: string;
  password: string;
  serverIp?: string; // Add serverIp as an optional prop
  setApiUrl: (url: string) => void;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setServerIp?: (ip: string) => void; // Add setter for serverIp
  onSave?: () => void;
}

const EnvironmentSetup: React.FC<EnvironmentSetupProps> = ({
  apiUrl,
  username,
  password,
  serverIp = '',
  setApiUrl,
  setUsername,
  setPassword,
  setServerIp,
  onSave
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  // Load configuration from storage on component mount
  useEffect(() => {
    const loadedConfig = getConfigFromStorage();
    if (loadedConfig) {
      setApiUrl(loadedConfig.apiUrl || apiUrl);
      setUsername(loadedConfig.username || username);
      setPassword(loadedConfig.password || password);
      if (setServerIp && loadedConfig.serverIp) {
        setServerIp(loadedConfig.serverIp);
      }
    }
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testAsteriskConnection();
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: "Successfully connected to the Asterisk server"
        });
      } else {
        toast({
          title: "Connection failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error testing connection"
      });
      
      toast({
        title: "Connection error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    // Save configuration to localStorage
    saveConfigToStorage({
      apiUrl,
      username,
      password,
      serverIp: serverIp
    });
    
    if (onSave) {
      onSave();
    }
    
    toast({
      title: "Configuration saved",
      description: "Asterisk server configuration has been saved"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Asterisk Server Environment
        </CardTitle>
        <CardDescription>
          Configure connection details for your Asterisk server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="apiUrl">Asterisk ARI URL</Label>
            <Input
              id="apiUrl"
              placeholder="http://your-asterisk-server:8088/ari"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              The URL of your Asterisk REST Interface (ARI)
            </p>
          </div>
          
          {setServerIp && (
            <div className="space-y-2">
              <Label htmlFor="serverIp">Asterisk Server IP</Label>
              <Input
                id="serverIp"
                placeholder="Enter your Asterisk server IP address"
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The IP address of your Asterisk server for SIP connections
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">ARI Username</Label>
              <Input
                id="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">ARI Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
        
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"} className="mt-4">
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={isTesting || !apiUrl || !username || !password}
        >
          {isTesting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={!apiUrl || !username || !password}
        >
          Save Configuration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnvironmentSetup;
