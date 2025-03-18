
import React from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardNav } from "@/components/DashboardNav";
import { SipProviderForm } from "@/components/sip/SipProviderForm";
import { SipProviderTable } from "@/components/sip/SipProviderTable";
import { useSipProviders } from "@/hooks/useSipProviders";

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <DashboardNav />
            </div>
            <div className="md:w-3/4">
              <div className="flex justify-between items-center mb-6">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default SipProviders;
