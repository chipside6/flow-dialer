
import React from 'react';
import { Navbar } from "@/components/Navbar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import GreetingFiles from './GreetingFiles';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const GreetingsFallback = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
    <span className="text-lg">Loading greeting files...</span>
  </div>
);

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="w-full h-96 flex flex-col items-center justify-center">
    <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md mb-4">
      <h3 className="text-lg font-medium">Something went wrong</h3>
      <p>{error.message}</p>
    </div>
    <button 
      onClick={() => window.location.reload()}
      className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
    >
      Reload Page
    </button>
  </div>
);

const GreetingsPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-7xl">
        <ErrorBoundary fallback={ErrorFallback}>
          <GreetingFiles />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
};

export default GreetingsPage;
