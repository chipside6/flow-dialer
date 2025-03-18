
import React, { useEffect } from "react";
import { Loader2, Info, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UserManagement } from "@/components/admin/UserManagement";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

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
    staleTime: 5000 // Short stale time
  });

  console.log("UsersDataFetcher - Data status:", { 
    isLoading, 
    isRefetching,
    isSuccess, 
    hasError: !!error,
    status,
    userCount: users?.length ?? 0
  });

  // Auto-retry once on initial error
  useEffect(() => {
    if (error && !isRefetching && !isSuccess) {
      console.log("UsersDataFetcher - Auto-retrying after error");
      const timer = setTimeout(() => {
        refetch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [error, isRefetching, isSuccess, refetch]);

  const handleRetry = () => {
    console.log("UsersDataFetcher - Manual retry triggered");
    toast({
      title: "Retrying",
      description: "Fetching updated user data...",
    });
    refetch();
  };

  // Calculate stats - providing defaults in case data isn't available yet
  const userCount = users?.length ?? 0;
  const affiliateCount = users?.filter(user => user.profile?.is_affiliate)?.length ?? 0;
  const hasLimitedData = users?.some(user => user.email === "Unknown");

  // Always render content regardless of loading state
  return (
    <DashboardLayout>
      <div className="space-y-6 py-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">
              Manage users and configure system settings
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            disabled={isRefetching}
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Data
          </Button>
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

        {(isLoading || isRefetching) && (
          <div className="flex items-center space-x-2 mb-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {isLoading && !users ? "Loading data..." : "Refreshing data..."}
            </span>
          </div>
        )}

        <AdminHeader 
          userCount={userCount} 
          affiliateCount={affiliateCount} 
        />
        
        <UserManagement 
          users={users || []} 
          isLoading={isLoading && !users} 
          error={error instanceof Error ? error : null} 
          onRetry={handleRetry}
        />
      </div>
    </DashboardLayout>
  );
}
