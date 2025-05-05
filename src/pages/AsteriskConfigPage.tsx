
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AsteriskConnectionTest } from '@/components/diagnostic/AsteriskConnectionTest';
import { useAuth } from "@/contexts/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Server } from "lucide-react";

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
            <h1 className="text-3xl font-bold mb-2">Asterisk Connection Test</h1>
            <p className="text-muted-foreground">
              Test your connection to the Asterisk server at 192.168.0.197
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Asterisk API Connection Test
              </CardTitle>
              <CardDescription>
                Test connection to your Asterisk server's REST Interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AsteriskConnectionTest />
            </CardContent>
          </Card>
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
