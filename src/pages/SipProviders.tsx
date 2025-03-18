
import React from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardNav } from "@/components/DashboardNav";
import { SipProviderForm } from "@/components/sip/SipProviderForm";
import { SipProviderTable } from "@/components/sip/SipProviderTable";
import { useSipProviders } from "@/hooks/useSipProviders";
import { Phone } from "lucide-react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarInset
} from "@/components/ui/sidebar";

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
      <SidebarProvider defaultOpen>
        <div className="flex flex-1 w-full pt-16">
          <Sidebar collapsible="offcanvas">
            <SidebarHeader>
              <div className="flex items-center p-2">
                <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white mr-2">
                  <Phone size={16} />
                </span>
                <span className="font-semibold text-lg">Flow Dialer</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <DashboardNav />
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="p-6">
            <div className="max-w-6xl mx-auto w-full">
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
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default SipProviders;
