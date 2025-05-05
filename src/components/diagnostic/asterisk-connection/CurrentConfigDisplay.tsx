
import React from "react";
import { Server } from "lucide-react";
import { AsteriskConfig } from "@/utils/asterisk/config";

interface CurrentConfigDisplayProps {
  currentConfig: AsteriskConfig;
  onRefreshConfig: () => void;
}

export const CurrentConfigDisplay: React.FC<CurrentConfigDisplayProps> = ({ 
  currentConfig, 
  onRefreshConfig 
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium flex items-center">
          <Server className="h-5 w-5 mr-2" />
          Connection Configuration
        </h3>
      </div>
      <div className="text-sm space-y-2">
        <p><span className="font-medium">API URL:</span> {currentConfig.apiUrl}</p>
        <p><span className="font-medium">Username:</span> {currentConfig.username}</p>
        <p><span className="font-medium">Password:</span> {currentConfig.password ? '••••••••' : 'Not set'}</p>
        <p><span className="font-medium">Server IP:</span> {currentConfig.serverIp}</p>
      </div>
    </div>
  );
};
