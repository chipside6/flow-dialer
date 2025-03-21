
import React from "react";
import { SipProviderForm } from "@/components/sip/SipProviderForm";
import { SipProviderTable } from "@/components/sip/SipProviderTable";
import { useSipProviders } from "@/hooks/useSipProviders";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, AlertCircle, ServerOff } from "lucide-react";
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
  
  console.log("SipProviders render - loading:", isLoading, "providers:", providers);
  
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
            <span className="ml-2">Loading SIP providers...</span>
          </div>
        ) : providers && providers.length === 0 ? (
          <div className="flex flex-col justify-center items-center min-h-[200px] w-full border rounded-lg p-8 text-center">
            <ServerOff className="w-12 h-12 mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">No SIP Providers Added Yet</h3>
            <p className="text-muted-foreground">
              Use the form above to add your first SIP provider for outgoing calls.
            </p>
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
