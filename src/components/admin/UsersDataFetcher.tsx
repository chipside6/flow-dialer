
import React, { useEffect } from "react";
import { Loader2, Info } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UserManagement } from "@/components/admin/UserManagement";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UsersDataFetcher() {
  console.log("UsersDataFetcher - Component rendering");

  const { 
    data: users, 
    isLoading, 
    error, 
    refetch, 
    isRefetching,
    isSuccess,
    status
  } = useAdminUsers({
    enabled: true // Force enable the query
  });

  useEffect(() => {
    console.log("UsersDataFetcher - Data status:", { 
      isLoading, 
      isRefetching,
      isSuccess, 
      hasError: !!error,
      status,
      userCount: users?.length ?? 0,
      users: users 
    });
  }, [users, isLoading, error, isRefetching, isSuccess, status]);

  // Calculate stats
  const userCount = users?.length ?? 0;
  const affiliateCount = users?.filter(user => user.profile?.is_affiliate)?.length ?? 0;
  const hasLimitedData = users?.some(user => user.email === "Unknown");

  console.log("UsersDataFetcher - Rendering with stats:", { 
    userCount, 
    affiliateCount, 
    hasLimitedData,
    isLoading,
    isSuccess
  });

  const handleRetry = () => {
    console.log("UsersDataFetcher - Retrying data fetch");
    refetch();
  };

  // FIXED: Only show the loading screen during the initial loading when we have no data
  // Important: We want to render content as soon as users is defined, even if empty array
  if (isLoading && users === undefined) {
    console.log("UsersDataFetcher - Showing loading screen (users undefined)");
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <span className="text-xl font-medium">Loading admin panel data...</span>
        </div>
      </DashboardLayout>
    );
  }

  // This ensures we show an error page only if we have an error AND no data
  if (error && users === undefined) {
    console.log("UsersDataFetcher - Showing error screen (users undefined)");
    return (
      <DashboardLayout>
        <div className="space-y-6 py-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">
              Manage users and configure system settings
            </p>
          </div>
          
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                {error instanceof Error ? error.message : "Failed to load admin data"}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={isRefetching}
                className="ml-4"
              >
                {isRefetching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // Show the main interface with whatever data we have, even if it's an empty array
  console.log("UsersDataFetcher - Showing main content screen with users:", users?.length ?? 0);
  
  return (
    <DashboardLayout>
      <div className="space-y-6 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage users and configure system settings
          </p>
        </div>

        {hasLimitedData && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600 mr-2" />
            <AlertDescription>
              Limited admin access. Some user information (like email addresses) may not be visible.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                {error instanceof Error ? error.message : "Error loading complete data"}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={isRefetching}
                className="ml-4"
              >
                {isRefetching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <AdminHeader userCount={userCount} affiliateCount={affiliateCount} />
        
        <UserManagement 
          users={users || []} 
          isLoading={isLoading || isRefetching} 
          error={error instanceof Error ? error : null} 
          onRetry={handleRetry}
        />
      </div>
    </DashboardLayout>
  );
}
