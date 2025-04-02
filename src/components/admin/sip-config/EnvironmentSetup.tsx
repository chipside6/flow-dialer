
import React, { useState } from "react";
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
  FileCode2
} from "lucide-react";
import { asteriskService } from "@/utils/asteriskService";

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
  );
};

export default EnvironmentSetup;
