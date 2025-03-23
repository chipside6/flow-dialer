
import React from "react";
import { SipProviderForm } from "@/components/sip/SipProviderForm";
import { SipProviderTable } from "@/components/sip/SipProviderTable";
import { useSipProviders } from "@/hooks/useSipProviders";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, AlertCircle, WifiOff } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const SipProviders = () => {
  const {
    providers,
    editingProvider,
    isLoading,
    error,
    handleAddProvider,
    handleEditProvider,
    handleCancelEdit,
    handleDeleteProvider,
    toggleProviderStatus
  } = useSipProviders();
  
  const isMobile = useIsMobile();
  
  const handleRetry = () => {
    // Force page refresh to retry loading
    window.location.reload();
  };
  
  const isNetworkError = error && 
    (error.message.includes("NetworkError") || 
     error.message.includes("network") || 
     error.message.includes("fetch") ||
     !navigator.onLine);
  
  return (
    <DashboardLayout>
      <div className="container-fluid">
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${isMobile ? 'pl-2' : ''}`}>SIP Providers</h1>
        </div>
        
        <SipProviderForm 
          onSubmit={handleAddProvider}
          editingProvider={editingProvider}
          onCancel={handleCancelEdit}
        />
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
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
                  onClick={handleRetry}
                  className="mt-2"
                >
                  {isNetworkError ? (
                    <>
                      <WifiOff className="mr-2 h-4 w-4" />
                      Retry Connection
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Retry
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          !error && (
            <SipProviderTable 
              providers={providers}
              onEdit={handleEditProvider}
              onDelete={handleDeleteProvider}
              onToggleStatus={toggleProviderStatus}
            />
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default SipProviders;
