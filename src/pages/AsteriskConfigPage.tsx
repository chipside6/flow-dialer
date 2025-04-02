
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaunchReadinessChecker from "@/components/admin/LaunchReadinessChecker";
import SipConfiguration from "@/components/admin/SipConfiguration";
import { useLocation } from "react-router-dom";

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
        <h1 className="text-3xl font-bold mb-6">Asterisk Configuration</h1>
        
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
