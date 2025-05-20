
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Info } from 'lucide-react';
import { GoipDeviceSetup } from '@/components/goip/GoipDeviceSetup';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/mobile-goip.css';

const ErrorFallback = (error: Error) => (
  <Card className="border-destructive">
    <CardHeader>
      <CardTitle className="text-destructive">Error Loading GoIP Setup</CardTitle>
      <CardDescription>
        {error.message || "Something went wrong loading the GoIP setup page"}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">
        Please try refreshing the page or contact support if the problem persists.
      </p>
      <button 
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </CardContent>
  </Card>
);

const GoipSetupContent = () => {
  const { user } = useAuth();
  
  // Log user information for debugging
  React.useEffect(() => {
    if (user) {
      console.log("User authenticated in GoipSetup:", user.id);
    } else {
      console.log("No user authenticated in GoipSetup");
    }
  }, [user]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">GoIP Device Setup</h1>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-primary" />
              <CardTitle>About GoIP Configuration</CardTitle>
            </div>
            <CardDescription>
              Register your GoIP device and manage its configuration.
              View all your registered devices below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our platform supports GoIP devices with 1, 2, 4, or 8 ports. After registration,
              you'll see your devices listed below with their port information.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid gap-6">
          <ErrorBoundary fallback={ErrorFallback}>
            <GoipDeviceSetup />
          </ErrorBoundary>
        </div>
      </div>
    </DashboardLayout>
  );
};

const GoipSetup = () => {
  return (
    <ProtectedRoute>
      <GoipSetupContent />
    </ProtectedRoute>
  );
};

export default GoipSetup;
