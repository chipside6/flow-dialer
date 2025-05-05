
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

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
  
  return (
    <Alert 
      variant={result.success ? "default" : "destructive"}
      className={`mt-6 animate-fadeIn ${result.success ? 'bg-green-50 text-green-800 border-green-300' : 'bg-red-50 text-red-800 border-red-300'}`}
    >
      {result.success ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <AlertTitle className="text-lg font-bold">
        {result.success ? "Connection Successful" : "Connection Failed"}
      </AlertTitle>
      <AlertDescription className="text-base mt-2">
        {result.message}
        {!result.success && (
          <div className="mt-4 p-3 bg-white rounded border border-red-200">
            <p className="font-medium">Troubleshooting Steps:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Check that port 8088 is open and accessible from this browser</li>
              <li>Verify your server is running at 192.168.0.197</li>
              <li>Make sure the Asterisk HTTP server is enabled</li>
              <li>Confirm CORS is properly configured on your Asterisk server</li>
              <li>Try accessing http://192.168.0.197:8088/ari/applications directly in your browser</li>
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
