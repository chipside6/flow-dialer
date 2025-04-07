
import React from "react";
import { SipProviderForm } from "@/components/sip/SipProviderForm";
import { SipProviderTable } from "@/components/sip/SipProviderTable";
import { useSipProviders } from "@/hooks/useSipProviders";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, AlertCircle, WifiOff } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/upgrade/LoadingState";

const SipProviders = () => {
  const {
    providers,
    editingProvider,
    isLoading,
    hasInitiallyLoaded,
    error,
    refetch,
    handleAddProvider,
    handleEditProvider,
    handleCancelEdit,
    handleDeleteProvider,
    toggleProviderStatus
  } = useSipProviders();
  
  const isMobile = useIsMobile();
  
  const isNetworkError = error && 
    (error.message?.includes("NetworkError") || 
     error.message?.includes("network") || 
     error.message?.includes("fetch") ||
     !navigator.onLine);
  
  return (
    <DashboardLayout>
      <div className="container-fluid max-w-full px-4 sm:px-6">
        <div className="mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${isMobile ? 'text-center' : ''} mt-2 sm:mt-0`}>SIP Providers</h1>
        </div>
        
        <SipProviderForm 
          onSubmit={handleAddProvider}
          editingProvider={editingProvider}
          onCancel={handleCancelEdit}
        />
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            {isNetworkError ? (
              <WifiOff className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {isNetworkError ? "Network Error" : "Error loading providers"}
            </AlertTitle>
            <AlertDescription className="flex flex-col space-y-2">
              <p>
                {isNetworkError 
                  ? "Unable to connect to the server. Please check your internet connection." 
                  : error.message}
              </p>
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetch}
                  className="mt-2"
                >
                  Retry Connection
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading && !hasInitiallyLoaded ? (
          <LoadingState 
            message="Loading SIP providers..." 
            onRetry={refetch}
          />
        ) : (
          !error && (
            <div className="w-full overflow-hidden max-w-full">
              <SipProviderTable 
                providers={providers}
                onEdit={handleEditProvider}
                onDelete={handleDeleteProvider}
                onToggleStatus={(id) => {
                  const provider = providers.find(p => p.id === id);
                  if (provider) {
                    toggleProviderStatus(id, !provider.isActive);
                  }
                }}
              />
              
              {isLoading && (
                <div className="mt-4 flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 text-primary mr-2 animate-spin" />
                  <span className="text-muted-foreground">Refreshing data...</span>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default SipProviders;
