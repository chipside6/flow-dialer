
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ServerCog } from "lucide-react";

export const InstallationAlert: React.FC = () => {
  return (
    <Alert variant="default" className="bg-accent/40 border-accent-foreground/20">
      <ServerCog className="h-4 w-4 text-accent-foreground" />
      <AlertTitle className="font-semibold text-accent-foreground">One-Time Supabase Installation Required</AlertTitle>
      <AlertDescription className="text-accent-foreground/90">
        This master configuration only needs to be installed <strong>once</strong> on your Asterisk server. 
        After installation, your server will automatically fetch campaign data directly from your Supabase database
        using the provided anon key. All outgoing calls will use your configured SIP providers and greeting files.
        <br /><br />
        <strong>Important:</strong> Make sure your Supabase Row Level Security (RLS) policies allow the necessary read access to the campaigns table.
      </AlertDescription>
    </Alert>
  );
};
