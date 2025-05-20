
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Info } from 'lucide-react';
import { GoipDeviceSetup } from '@/components/goip/GoipDeviceSetup';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingErrorBoundary } from '@/components/common/LoadingErrorBoundary';
import { LoadingState } from '@/components/upgrade/LoadingState';
import { useToast } from '@/hooks/use-toast';

const GoipSetupContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    
    toast({
      title: "Refreshing device data",
      description: "Attempting to reload your GoIP device information"
    });
    
    // Simulate a refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return true;
  };
  
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
          <LoadingErrorBoundary
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            loadingComponent={
              <LoadingState 
                message="Loading your GoIP configuration..." 
                onRetry={handleRetry}
              />
            }
          >
            <GoipDeviceSetup />
          </LoadingErrorBoundary>
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
