
import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SupabaseStatus } from "@/components/diagnostic/SupabaseStatus";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DiagnosticActions } from "@/components/diagnostic/DiagnosticActions";
import { ConnectionInfo } from "@/components/diagnostic/ConnectionInfo";

const DiagnosticPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleRefresh = () => {
    // Refresh diagnostic data
    window.location.reload();
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Supabase Diagnostic</h1>
            <p className="text-muted-foreground mt-1">
              Troubleshoot data persistence and connection issues
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
        
        <DiagnosticActions onRefresh={handleRefresh} />
        
        <SupabaseStatus />
        
        <div className="mt-8">
          <ConnectionInfo />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticPage;
