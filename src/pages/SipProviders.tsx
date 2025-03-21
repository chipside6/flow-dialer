
import React, { useEffect } from "react";
import { SipProviderForm } from "@/components/sip/SipProviderForm";
import { SipProviderTable } from "@/components/sip/SipProviderTable";
import { useSipProviders } from "@/hooks/useSipProviders";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  
  console.log("SipProviders render - loading:", isLoading, "providers:", providers?.length);
  
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
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message || "Failed to load SIP providers. Please try again."}
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px] w-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <SipProviderTable 
            providers={providers || []}
            onEdit={handleEditProvider}
            onDelete={handleDeleteProvider}
            onToggleStatus={toggleProviderStatus}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default SipProviders;
