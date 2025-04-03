
import React from "react";
import { AlertCircle } from "lucide-react";

interface ValidationErrorProps {
  error: string | null;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-destructive/10 p-3 rounded-md flex items-start mb-4">
      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-2 flex-shrink-0" />
      <p className="text-sm text-destructive">{error}</p>
    </div>
  );
};
