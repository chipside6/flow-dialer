
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AsteriskConfigSection } from '@/components/admin/asterisk/AsteriskConfigSection';
import { AsteriskConnectionTest } from '@/components/diagnostic/AsteriskConnectionTest';
import { useAuth } from "@/contexts/auth";
import ProtectedRoute from "@/components/ProtectedRoute";

const AsteriskConfigPageContent = () => {
  const { user, isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="container py-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin Access Required</AlertTitle>
            <AlertDescription>
              This page is only accessible to administrators.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Asterisk Configuration</h1>
            <p className="text-muted-foreground">
              Configure and manage your Asterisk server connection
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Test</CardTitle>
              <CardDescription>
                Verify your connection to the Asterisk API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AsteriskConnectionTest />
            </CardContent>
          </Card>

          {user && <AsteriskConfigSection userId={user.id} />}
        </div>
      </div>
    </DashboardLayout>
  );
};

const AsteriskConfigPage = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AsteriskConfigPageContent />
    </ProtectedRoute>
  );
};

export default AsteriskConfigPage;
