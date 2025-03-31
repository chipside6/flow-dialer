
import React, { useEffect } from "react";
import { RefreshCw, Info, Loader2 } from "lucide-react";
import { AdminHeader } from "./AdminHeader";
import { UsersList } from "./UsersList";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export function AdminPanel() {
  console.log("AdminPanel - Component rendering");
  
  const { 
    data: users = [], 
    isLoading, 
    error, 
    refetch, 
    isRefetching,
    isSuccess,
    isFetched
  } = useAdminUsers({
    staleTime: 5000,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: 1000
  });

  const { toast } = useToast();
  
  console.log("AdminPanel - Data status:", { 
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
      console.log("AdminPanel - Auto-retrying after error");
      const timer = setTimeout(() => {
        refetch();
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log("AdminPanel - Periodic refresh");
      refetch();
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [error, isRefetching, isSuccess, refetch]);

  const handleRetry = () => {
    console.log("AdminPanel - Manual retry triggered");
    toast({
      title: "Refreshing Data",
      description: "Fetching updated user data...",
    });
    refetch();
  };

  // Calculate stats
  const userCount = users?.length ?? 0;
  
  // Force rendering content after a reasonable timeout
  const [forceRender, setForceRender] = React.useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((isLoading || !isFetched) && !users.length) {
        console.log("AdminPanel - Forcing render after timeout");
        setForceRender(true);
      }
    }, 2000);
    
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
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-lg mt-6" />
          </div>
        )}

        {shouldShowContent && (
          <>
            <AdminHeader userCount={userCount} />
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <UsersList 
                users={users} 
                isLoading={isLoading && !forceRender && !isFetched} 
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
