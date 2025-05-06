
import React, { useState, useEffect } from 'react';
import { connectionService } from "@/utils/asterisk/connectionService";
import { useToast } from "@/components/ui/use-toast";

import { ConnectionTestButton } from "./asterisk-connection/ConnectionTestButton";
import { ConnectionResultDisplay } from "./asterisk-connection/ConnectionResultDisplay";
import { CurrentConfigDisplay } from "./asterisk-connection/CurrentConfigDisplay";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Server, Info } from "lucide-react";
import { getConfigFromStorage } from "@/utils/asterisk/config";

export const AsteriskConnectionTest: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { toast } = useToast();
  
  // Use the specified server IP
  const currentConfig = getConfigFromStorage();
  const serverIp = currentConfig.serverIp || "192.168.0.197";
  
  // Auto-test connection on component mount
  useEffect(() => {
    // Auto-test connection only if there's no result yet
    if (!connectionResult) {
      testConnection();
    }
  }, []);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      toast({
        title: "Testing Connection",
        description: `Attempting to connect to Asterisk server at ${serverIp}:8088...`,
      });

      console.log("Starting Asterisk connection test to server:", serverIp);

      const result = await connectionService.testConnection();
      setConnectionResult(result);
      console.log("Connection test result:", result);

      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Connection test error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionResult({
        success: false,
        message: errorMessage
      });

      toast({
        title: "Error Testing Connection",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <Server className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Server Information</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          <p className="mb-2">Connecting to Asterisk server at <strong>{serverIp}:8088</strong> using credentials <strong>admin/admin</strong>.</p>
        </AlertDescription>
      </Alert>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-5 w-5 text-slate-500" />
          <span className="font-medium">Connection Information</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          This test will attempt to connect to your Asterisk server's REST Interface (ARI) using a secure Supabase Edge Function:
        </p>
        <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 ml-4 space-y-1">
          <li>Server: <span className="font-mono">{serverIp}</span></li>
          <li>Port: <span className="font-mono">8088</span></li>
          <li>Username: <span className="font-mono">admin</span></li>
          <li>Password: <span className="font-mono">admin</span></li>
          <li>Endpoint: <span className="font-mono">http://{serverIp}:8088/ari/applications</span></li>
        </ul>
      </div>
      
      <CurrentConfigDisplay 
        currentConfig={{
          apiUrl: `http://${serverIp}:8088/ari/`,
          username: "admin",
          password: "admin",
          serverIp: serverIp
        }}
      />
      
      <ConnectionTestButton 
        isLoading={isTestingConnection}
        onClick={testConnection}
      />

      <ConnectionResultDisplay result={connectionResult} />
    </div>
  );
};
