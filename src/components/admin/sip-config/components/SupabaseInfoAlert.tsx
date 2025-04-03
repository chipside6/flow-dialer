
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface SupabaseInfoAlertProps {
  supabaseUrl: string;
}

export const SupabaseInfoAlert: React.FC<SupabaseInfoAlertProps> = ({ supabaseUrl }) => {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">Supabase Integration</AlertTitle>
      <AlertDescription className="text-blue-700">
        The master configuration uses your Supabase URL: <strong>{supabaseUrl}</strong> and the anonymous API key 
        to connect to your Supabase backend. No additional configuration is needed.
      </AlertDescription>
    </Alert>
  );
};
