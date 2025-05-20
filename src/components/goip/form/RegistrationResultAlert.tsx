
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle } from 'lucide-react';

interface RegistrationResultProps {
  success: boolean;
  message: string;
}

export const RegistrationResultAlert = ({ success, message }: RegistrationResultProps) => {
  if (!message) return null;
  
  return (
    <Alert 
      variant={success ? "default" : "destructive"}
      className={`mb-4 ${success ? "bg-green-50 border-green-200 dark:bg-green-900/20" : ""}`}
    >
      {success ? (
        <Check className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>
        {success ? "Registration Successful" : "Registration Failed"}
      </AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
