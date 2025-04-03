
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, Key } from "lucide-react";

interface SupabaseInfoAlertProps {
  supabaseUrl: string;
}

export const SupabaseInfoAlert: React.FC<SupabaseInfoAlertProps> = ({ supabaseUrl }) => {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">Supabase Integration</AlertTitle>
      <AlertDescription className="text-blue-700">
        <div className="space-y-2">
          <p>
            The master configuration uses your Supabase URL: <strong>{supabaseUrl}</strong> and your Supabase 
            anonymous API key to connect to your database.
          </p>
          <p className="flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-600" />
            <span>Your Supabase anonymous key is <strong>automatically included</strong> in the generated configuration.</span>
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
