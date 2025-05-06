import React from "react";
import { Server } from "lucide-react";
import { AsteriskConfig } from "@/utils/asterisk/config";

interface CurrentConfigDisplayProps {
  config: AsteriskConfig;
  onRefreshConfig?: () => void;
}

export const CurrentConfigDisplay: React.FC<CurrentConfigDisplayProps> = ({ 
  config,
  onRefreshConfig
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium flex items-center">
          <Server className="h-5 w-5 mr-2" />
          Asterisk Connection Configuration
        </h3>
      </div>
      <div className="text-sm space-y-2">
        <p><span className="font-medium">API URL:</span> {config.apiUrl}</p>
        <p><span className="font-medium">Username:</span> {config.username}</p>
        <p><span className="font-medium">Password:</span> {config.password ? '••••••••' : 'Not set'}</p>
        <p><span className="font-medium">Server IP:</span> {config.serverIp}</p>
        <p className="text-xs text-muted-foreground mt-2">This configuration is fixed to use the Asterisk server at 192.168.0.197</p>
      </div>
    </div>
  );
};
