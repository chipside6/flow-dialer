
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Network } from "lucide-react";

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
  
  const isNetworkError = result.message.toLowerCase().includes('network') || 
                         result.message.toLowerCase().includes('connectivity') ||
                         result.message.toLowerCase().includes('cannot reach');
  
  return (
    <Alert variant={result.success ? "default" : isNetworkError ? "warning" : "destructive"}>
      {result.success ? (
        <CheckCircle className="h-4 w-4" />
      ) : isNetworkError ? (
        <Network className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>
        {result.success ? "Connection Successful" : isNetworkError ? "Network Connectivity Error" : "Connection Failed"}
      </AlertTitle>
      <AlertDescription>
        {result.message}
      </AlertDescription>
    </Alert>
  );
};
