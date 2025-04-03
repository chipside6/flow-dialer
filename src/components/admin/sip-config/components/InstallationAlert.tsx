
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ServerCheck } from "lucide-react";

export const InstallationAlert: React.FC = () => {
  return (
    <Alert variant="default" className="bg-accent/40 border-accent-foreground/20">
      <ServerCheck className="h-4 w-4 text-accent-foreground" />
      <AlertTitle className="font-semibold text-accent-foreground">One-Time Installation Required</AlertTitle>
      <AlertDescription className="text-accent-foreground/90">
        This master configuration only needs to be installed <strong>once</strong> on your Asterisk server. 
        After installation, your server will automatically fetch user and campaign configurations from your Supabase API
        without requiring manual updates for each campaign. All outgoing calls will use the users' own SIP providers and resources,
        while your server acts only as the central station for greeting audio and call transfers.
      </AlertDescription>
    </Alert>
  );
};
