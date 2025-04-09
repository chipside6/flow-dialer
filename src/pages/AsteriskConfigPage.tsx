
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AsteriskConfigPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Redirect to GoIP setup page after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/goip-setup');
    }, 5000); // 5 second delay before auto-redirect
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  const handleRedirectNow = () => {
    navigate('/goip-setup');
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">GoIP Device Setup</h1>
            <p className="text-muted-foreground">
              Configure your GoIP device to connect to our system
            </p>
          </div>
        </div>
        
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Redirecting to GoIP Setup</AlertTitle>
          <AlertDescription>
            You're being redirected to the GoIP setup page where you can configure your device.
            Each user brings their own GoIP device - no system-wide Asterisk configuration is needed.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              GoIP Device Configuration
            </CardTitle>
            <CardDescription>
              Generate credentials and setup instructions for your GoIP device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              Our system is designed for users to bring their own GoIP devices. You only need to:
            </p>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>Generate SIP credentials specifically for your account</li>
              <li>Configure your GoIP device with these credentials</li>
              <li>Start using your device with our campaigns</li>
            </ol>
            
            <div className="flex flex-col items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={handleRedirectNow} className="w-full md:w-auto">
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to GoIP Setup Now
              </Button>
              <p className="text-sm text-muted-foreground">
                (You'll be redirected automatically in a few seconds)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AsteriskConfigPage;
