
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import SipConfiguration from "@/components/admin/SipConfiguration";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Server } from "lucide-react";

const AsteriskConfigPage = () => {
  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center gap-2 mb-2">
          <Server className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Asterisk Server Configuration</h1>
        </div>
        
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>One-Time Configuration</AlertTitle>
          <AlertDescription>
            This configuration file only needs to be installed <strong>once</strong> on your Asterisk server.
            After installation, all your users' campaigns will work automatically without further configuration.
          </AlertDescription>
        </Alert>
        
        <SipConfiguration />
      </div>
    </DashboardLayout>
  );
};

export default AsteriskConfigPage;
