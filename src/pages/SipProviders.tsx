
import React, { useEffect } from "react";
import { SipProviderForm } from "@/components/sip/SipProviderForm";
import { SipProviderTable } from "@/components/sip/SipProviderTable";
import { useSipProviders } from "@/hooks/useSipProviders";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const SipProviders = () => {
  const {
    providers,
    editingProvider,
    handleAddProvider,
    handleEditProvider,
    handleCancelEdit,
    handleDeleteProvider,
    toggleProviderStatus
  } = useSipProviders();
  
  // Add a class to the body to ensure our CSS selectors work
  useEffect(() => {
    document.body.classList.add('sip-providers-page');
    return () => {
      document.body.classList.remove('sip-providers-page');
    };
  }, []);
  
  return (
    <DashboardLayout>
      <div className="container-fluid px-4 py-6 w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">SIP Providers</h1>
        </div>
        
        <SipProviderForm 
          onSubmit={handleAddProvider}
          editingProvider={editingProvider}
          onCancel={handleCancelEdit}
        />
        
        <SipProviderTable 
          providers={providers}
          onEdit={handleEditProvider}
          onDelete={handleDeleteProvider}
          onToggleStatus={toggleProviderStatus}
        />
      </div>
    </DashboardLayout>
  );
};

export default SipProviders;
