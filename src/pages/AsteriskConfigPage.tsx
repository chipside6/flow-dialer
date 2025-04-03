
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaunchReadinessChecker from "@/components/admin/LaunchReadinessChecker";
import SipConfiguration from "@/components/admin/SipConfiguration";
import { useLocation } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Server } from "lucide-react";

const AsteriskConfigPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("readiness");
  
  // If navigating with a specific tab request (from LaunchReadinessChecker)
  useEffect(() => {
    const state = location.state as { tab?: string } | null;
    if (state?.tab) {
      setActiveTab(state.tab);
    }
  }, [location]);
  
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
            The SIP Configuration tab provides a master configuration file that only needs to be installed <strong>once</strong> on your Asterisk server.
            After installation, all your users' campaigns will work automatically without further configuration.
          </AlertDescription>
        </Alert>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="readiness">Readiness Check</TabsTrigger>
            <TabsTrigger value="config">SIP Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="readiness">
            <LaunchReadinessChecker />
          </TabsContent>
          
          <TabsContent value="config">
            <SipConfiguration />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AsteriskConfigPage;
