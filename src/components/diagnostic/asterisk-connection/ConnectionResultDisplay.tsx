
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Network, WifiOff } from "lucide-react";

interface ConnectionResultDisplayProps {
  result: {
    success: boolean;
    message: string;
  } | null;
}

export const ConnectionResultDisplay: React.FC<ConnectionResultDisplayProps> = ({
  result
}) => {
  if (!result) return null;
  
  // Enhanced detection of network errors with more comprehensive checks
  const isNetworkError = 
    result.message.toLowerCase().includes('network') || 
    result.message.toLowerCase().includes('connectivity') ||
    result.message.toLowerCase().includes('cannot reach') ||
    result.message.toLowerCase().includes('cannot connect') ||
    result.message.toLowerCase().includes('timed out') ||
    result.message.toLowerCase().includes('unreachable') ||
    result.message.toLowerCase().includes('cors') ||
    result.message.toLowerCase().includes('failed to fetch');
  
  return (
    <Alert 
      variant={result.success ? "default" : isNetworkError ? "warning" : "destructive"}
      className="mt-2 animate-fadeIn"
    >
      {result.success ? (
        <CheckCircle className="h-4 w-4" />
      ) : isNetworkError ? (
        <WifiOff className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>
        {result.success ? "Connection Successful" : isNetworkError ? "Network Connectivity Issue" : "Connection Failed"}
      </AlertTitle>
      <AlertDescription className="text-sm">
        {result.message}
        {isNetworkError && (
          <div className="mt-1 text-xs">
            Check your server IP address, network connectivity, and make sure the Asterisk server is running.
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
