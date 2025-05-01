
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
    <Alert variant={result.success ? "default" : "destructive"}>
      {result.success ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>
        {result.success ? "Connection Successful" : "Connection Failed"}
      </AlertTitle>
      <AlertDescription>
        {result.message}
      </AlertDescription>
    </Alert>
  );
};
