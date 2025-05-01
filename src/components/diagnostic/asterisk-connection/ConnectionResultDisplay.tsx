
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
  
  const Icon = result.success ? CheckCircle : AlertCircle;
  const title = result.success ? "Connection Successful" : "Connection Failed";
  
  return (
    <Alert variant={result.success ? "default" : "destructive"}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{result.message}</AlertDescription>
    </Alert>
  );
};
