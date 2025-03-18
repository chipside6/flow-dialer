
import React from "react";
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
  
  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
};

export default SipProviders;
