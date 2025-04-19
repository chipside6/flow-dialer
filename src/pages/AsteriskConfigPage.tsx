
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SetupInstructions } from '@/components/goip/SetupInstructions';
import { AsteriskConfigSection } from '@/components/admin/asterisk/AsteriskConfigSection';
import { useAuth } from "@/contexts/auth";
import ProtectedRoute from "@/components/ProtectedRoute";

const AsteriskConfigPageContent = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  // Redirect regular users to GoIP setup page
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="container py-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin Access Required</AlertTitle>
            <AlertDescription>
              This page is only accessible to administrators. Please return to the GoIP setup page.
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.href = '/goip-setup'}>
            Go to GoIP Setup
          </Button>
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
              Configure and manage your Asterisk server for GoIP devices
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {user && <AsteriskConfigSection userId={user.id} />}
          
          <Card>
            <CardHeader>
              <CardTitle>Installation Guide</CardTitle>
              <CardDescription>
                Follow these steps to set up your Asterisk server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SetupInstructions />
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
