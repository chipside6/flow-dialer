
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
    status,
    isFetching
  } = useAdminUsers({
    enabled: true // Force enable the query
  });

  useEffect(() => {
    console.log("UsersDataFetcher - Data status:", { 
      isLoading, 
      isRefetching,
      isFetching,
      isSuccess, 
      hasError: !!error,
      status,
      userCount: users?.length ?? 0,
      hasUsersData: Array.isArray(users)
    });
  }, [users, isLoading, error, isRefetching, isSuccess, status, isFetching]);

  // Calculate stats
  const userCount = users?.length ?? 0;
  const affiliateCount = users?.filter(user => user.profile?.is_affiliate)?.length ?? 0;
  const hasLimitedData = users?.some(user => user.email === "Unknown");

  console.log("UsersDataFetcher - Rendering with stats:", { 
    userCount, 
    affiliateCount, 
    hasLimitedData,
    isLoading,
    isFetching,
    isSuccess
  });

  const handleRetry = () => {
    console.log("UsersDataFetcher - Retrying data fetch");
    refetch();
  };

  // FIXED LOADING CONDITION: Only show loading when no data is available yet
  // This prevents getting stuck in loading state indefinitely
  if (isLoading && !users) {
    console.log("UsersDataFetcher - Showing loading screen (no users data yet)");
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <span className="text-xl font-medium">Loading admin panel data...</span>
          <p className="text-sm text-muted-foreground mt-2">
            Initializing...
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // This ensures we show an error page only if we have an error AND no data
  if (error && !users) {
    console.log("UsersDataFetcher - Showing error screen (no users data available)");
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

  // Proceed with rendering the main content with whatever data we have
  // At this point, we should always have users (even if it's an empty array)
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

        {isFetching && (
          <div className="flex items-center space-x-2 mb-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Refreshing data...</span>
          </div>
        )}

        <AdminHeader userCount={userCount} affiliateCount={affiliateCount} />
        
        <UserManagement 
          users={users || []} 
          isLoading={isFetching} 
          error={error instanceof Error ? error : null} 
          onRetry={handleRetry}
        />
      </div>
    </DashboardLayout>
  );
}
