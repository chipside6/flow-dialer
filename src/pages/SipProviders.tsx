
import React, { useEffect } from "react";
import { SipProviderForm } from "@/components/sip/SipProviderForm";
import { SipProviderTable } from "@/components/sip/SipProviderTable";
import { useSipProviders } from "@/hooks/useSipProviders";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, AlertCircle, ServerOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SipProviders = () => {
  // Use the hook outside of any conditions to avoid React errors
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
  
  // Get mobile state safely
  const isMobile = useIsMobile();
  
  useEffect(() => {
    console.log("SipProviders component - loading:", isLoading, "providers:", providers?.length);
  }, [isLoading, providers]);
  
  const renderContent = () => {
    console.log("Rendering content - isLoading:", isLoading, "error:", !!error, "providers:", providers?.length);
    
    if (error) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "Failed to load SIP providers. Please try again."}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[200px] w-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading SIP providers...</span>
        </div>
      );
    }
    
    if (!providers || providers.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center min-h-[200px] w-full border rounded-lg p-8 text-center">
          <ServerOff className="w-12 h-12 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">No SIP Providers Added Yet</h3>
          <p className="text-muted-foreground">
            Use the form above to add your first SIP provider for outgoing calls.
          </p>
        </div>
      );
    }
    
    return (
      <SipProviderTable 
        providers={providers}
        onEdit={handleEditProvider}
        onDelete={handleDeleteProvider}
        onToggleStatus={toggleProviderStatus}
      />
    );
  };
  
  // Use this safer approach to rendering that avoids potential render issues
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
        
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default SipProviders;
