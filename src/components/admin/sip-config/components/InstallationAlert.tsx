
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const InstallationAlert: React.FC = () => {
  return (
    <Alert variant="default">
      <AlertTitle>One-Time Installation Required</AlertTitle>
      <AlertDescription>
        This master configuration only needs to be installed <strong>once</strong> on your Asterisk server. 
        After installation, your server will automatically fetch user and campaign configurations from your Supabase API
        without requiring manual updates for each campaign.
      </AlertDescription>
    </Alert>
  );
};
