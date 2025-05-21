
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoipDeviceSetup } from '@/components/goip/GoipDeviceSetup';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/mobile-goip.css';

const ErrorFallback = (error: Error) => (
  <div className="p-4 border border-destructive rounded-md bg-destructive/10">
    <h3 className="font-medium text-destructive mb-2">Error Loading GoIP Setup</h3>
    <p className="text-sm text-muted-foreground mb-4">
      {error.message || "Something went wrong loading the GoIP setup page"}
    </p>
    <button 
      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      onClick={() => window.location.reload()}
    >
      Refresh Page
    </button>
  </div>
);

const GoipSetupContent = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <h1 className="text-2xl font-bold mb-6">GoIP Device Setup</h1>
        
        <div className="grid gap-6">
          <ErrorBoundary fallback={ErrorFallback}>
            <GoipDeviceSetup />
          </ErrorBoundary>
        </div>
      </div>
    </DashboardLayout>
  );
};

const GoipSetup = () => {
  return (
    <ProtectedRoute>
      <GoipSetupContent />
    </ProtectedRoute>
  );
};

export default GoipSetup;
