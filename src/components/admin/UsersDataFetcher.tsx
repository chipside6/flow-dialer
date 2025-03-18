
import React, { useEffect } from "react";
import { Loader2, Info, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UserManagement } from "@/components/admin/UserManagement";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
    staleTime: 10000 // Shorter stale time
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
    
    // Auto-retry once if we have an error but no users
    if (error && !users && !isRefetching && !isFetching) {
      console.log("UsersDataFetcher - Auto-retrying after error");
      setTimeout(() => refetch(), 1000);
    }
  }, [users, isLoading, error, isRefetching, isSuccess, status, isFetching, refetch]);

  // Calculate stats - providing defaults in case data isn't available yet
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

  // Always render content after initial mount, regardless of loading state
  // This ensures we don't get stuck in a loading screen
  return (
    <DashboardLayout>
      <div className="space-y-6 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage users and configure system settings
            {isLoading && !users && " (Loading...)"}
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

        {(isLoading || isFetching) && (
          <div className="flex items-center space-x-2 mb-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {isLoading && !users ? "Loading initial data..." : "Refreshing data..."}
            </span>
          </div>
        )}

        <AdminHeader 
          userCount={userCount} 
          affiliateCount={affiliateCount} 
        />
        
        <UserManagement 
          users={users || []} 
          isLoading={isLoading || isFetching} 
          error={error instanceof Error ? error : null} 
          onRetry={handleRetry}
        />
      </div>
    </DashboardLayout>
  );
}
