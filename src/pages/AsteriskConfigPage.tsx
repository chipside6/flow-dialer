
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaunchReadinessChecker from "@/components/admin/LaunchReadinessChecker";
import SipConfiguration from "@/components/admin/SipConfiguration";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

const AsteriskConfigPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("readiness");
  const { isAdmin, isLoading, initialized } = useAuth();
  
  // If navigating with a specific tab request (from LaunchReadinessChecker)
  useEffect(() => {
    const state = location.state as { tab?: string } | null;
    if (state?.tab) {
      setActiveTab(state.tab);
    }
  }, [location]);
  
  // Show loading state while checking permissions
  if (isLoading || !initialized) {
    return (
      <DashboardLayout>
        <div className="container flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  // Redirect non-admin users to the unauthorized page
  if (isAdmin === false) {
    return <Navigate to="/unauthorized" replace />;
  }
  
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
