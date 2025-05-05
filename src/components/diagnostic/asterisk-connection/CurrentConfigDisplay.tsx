
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Server } from "lucide-react";
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
          <Server className="h-4 w-4 mr-2" />
          Current Asterisk Configuration
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefreshConfig} 
          title="Refresh configuration"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-sm space-y-1">
        <p><span className="font-medium">API URL:</span> {currentConfig.apiUrl || 'Not set'}</p>
        <p><span className="font-medium">Username:</span> {currentConfig.username || 'Not set'}</p>
        <p><span className="font-medium">Password:</span> {currentConfig.password ? '••••••••' : 'Not set'}</p>
        <p><span className="font-medium">Server IP:</span> {currentConfig.serverIp || 'Not set'}</p>
      </div>
      <div className="mt-3 text-xs text-slate-500">
        Using detected IP: http://192.168.0.197:8088/ari/
      </div>
    </div>
  );
};
