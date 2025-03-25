
import React, { useState, useEffect } from "react";
import { SipProviderForm } from "@/components/sip/SipProviderForm";
import { SipProviderTable } from "@/components/sip/SipProviderTable";
import { useSipProviders } from "@/hooks/useSipProviders";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, AlertCircle, WifiOff, RefreshCw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
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
  const [forceShowContent, setForceShowContent] = useState(false);
  
  // Force show content after shorter timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setForceShowContent(true);
        toast({
          title: "Still loading data",
          description: "We're showing you the UI while provider data continues to load",
          variant: "default"
        });
      }
    }, 5000); // Reduced from 6 seconds to 5 seconds
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  const isNetworkError = error && 
    (error.message?.includes("NetworkError") || 
     error.message?.includes("network") || 
     error.message?.includes("fetch") ||
     !navigator.onLine);

  // Handle manual refresh
  const handleManualRefresh = () => {
    toast({
      title: "Refreshing providers",
      description: "Attempting to reload your SIP providers"
    });
    refetch();
  };
  
  return (
    <DashboardLayout>
      <div className="container-fluid">
        <div className="mb-6 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${isMobile ? 'pl-2' : ''}`}>SIP Providers</h1>
          
          {!isLoading && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
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
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading && !forceShowContent && !hasInitiallyLoaded ? (
          <LoadingState 
            message="Loading SIP providers..." 
            onRetry={handleManualRefresh}
          />
        ) : (
          !error && (
            <>
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
                <div className="mt-4 bg-blue-50 p-4 rounded border border-blue-200 flex items-center">
                  <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
                  <span className="text-blue-700">Refreshing provider data...</span>
                </div>
              )}
            </>
          )
        )}
        
        {(forceShowContent && isLoading && !hasInitiallyLoaded) && (
          <div className="mt-4 bg-orange-50 p-4 rounded border border-orange-200 flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            <span className="text-orange-700">Still loading... You can use the form above to add a new provider while we finish loading your data.</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SipProviders;
