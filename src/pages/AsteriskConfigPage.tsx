
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
              Test your connection to the Asterisk server
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Local Server Information */}
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <Server className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">Local Server Detected</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              <p className="mb-2">Your server appears to be running locally at <strong>192.168.0.197</strong>. This configuration has been auto-detected.</p>
              <p>For best results, make sure both your Asterisk server and GoIP device can communicate on the same network.</p>
            </AlertDescription>
          </Alert>

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
