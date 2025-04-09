
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AsteriskGuide } from '@/components/goip/AsteriskGuide';
import { useAuth } from "@/contexts/auth/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

const AsteriskConfigPageContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  // Redirect regular users to GoIP setup page after a short delay
  useEffect(() => {
    if (!isAdmin) {
      const timer = setTimeout(() => {
        navigate('/goip-setup');
        toast({
          title: "Redirected",
          description: "This page is only accessible to administrators."
        });
      }, 3000); // 3 second delay before auto-redirect
      
      return () => clearTimeout(timer);
    }
  }, [navigate, isAdmin, toast]);

  const handleRedirectNow = () => {
    navigate('/goip-setup');
  };

  // If not admin, show a message and redirect
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="container py-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin Access Required</AlertTitle>
            <AlertDescription>
              This page is only accessible to administrators. You are being redirected to the GoIP setup page.
            </AlertDescription>
          </Alert>
          
          <Button onClick={handleRedirectNow}>Go to GoIP Setup Now</Button>
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
              Configure and manage the Asterisk server for GoIP devices
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System-Wide Asterisk Configuration
              </CardTitle>
              <CardDescription>
                Admin-only settings for configuring the Asterisk server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                As an administrator, you can configure the system-wide Asterisk settings here.
                Regular users only need to set up their individual GoIP devices.
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <Button onClick={() => navigate('/goip-setup')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View User GoIP Setup Page
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Asterisk Technical Guide - Admin Only */}
          <AsteriskGuide />
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
