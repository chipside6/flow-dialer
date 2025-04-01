
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaunchReadinessChecker from "@/components/admin/LaunchReadinessChecker";
import SipConfiguration from "@/components/admin/SipConfiguration";

const AsteriskConfigPage = () => {
  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Asterisk Configuration</h1>
        
        <Tabs defaultValue="readiness" className="w-full">
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
