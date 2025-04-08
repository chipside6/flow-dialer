
import React, { useEffect } from "react";
import { Loader2, Info, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UserManagement } from "@/components/admin/UserManagement";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function UsersDataFetcher() {
  console.log("UsersDataFetcher - Component rendering");

  const { toast } = useToast();
  
  const { 
    data: users = [], 
    isLoading, 
    error, 
    refetch, 
    isRefetching,
    isSuccess,
    isFetched
  } = useAdminUsers({
    staleTime: 5000, // Short stale time for more frequent updates
    refetchOnReconnect: true,
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: 1000 // 1 second delay between retries
  });

  console.log("UsersDataFetcher - Data status:", { 
    isLoading, 
    isRefetching,
    isSuccess,
    isFetched,
    hasError: !!error,
    userCount: users?.length ?? 0
  });

  // Auto-retry on initial load plus periodic refresh
  useEffect(() => {
    // Auto-retry once on initial error
    if (error && !isRefetching && !isSuccess) {
      console.log("UsersDataFetcher - Auto-retrying after error");
      const timer = setTimeout(() => {
        refetch();
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log("UsersDataFetcher - Periodic refresh");
      refetch();
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [error, isRefetching, isSuccess, refetch]);

  const handleRetry = () => {
    console.log("UsersDataFetcher - Manual retry triggered");
    toast({
      title: "Refreshing Data",
      description: "Fetching updated user data...",
    });
    refetch();
  };

  // Calculate stats - providing defaults for when data isn't available
  const userCount = users?.length ?? 0;
  
  // Force rendering content after a reasonable timeout, even if still loading
  const [forceRender, setForceRender] = React.useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((isLoading || !isFetched) && !users.length) {
        console.log("UsersDataFetcher - Forcing render after timeout");
        setForceRender(true);
      }
    }, 2000); // Shorter timeout to ensure UI responsiveness
    
    return () => clearTimeout(timer);
  }, [isLoading, isFetched, users]);

  // Show content when: data is loaded, or data exists, or timeout occurred
  const shouldShowContent = !isLoading || users.length > 0 || forceRender || isFetched;

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

        {error && (
          <Alert variant="destructive" className="mb-6">
            <Info className="h-4 w-4 mr-2" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                There was an error loading user data. Please try refreshing.
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

        {(!shouldShowContent) && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-lg mt-6" />
          </div>
        )}

        {shouldShowContent && (
          <>
            <AdminHeader userCount={userCount} />
            
            <UserManagement 
              users={users} 
              isLoading={isLoading && !forceRender && !isFetched} 
              error={error instanceof Error ? error : null} 
              onRetry={handleRetry}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
