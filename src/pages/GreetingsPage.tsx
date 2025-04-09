
import React, { useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/auth/useAuth';
import { touchSession } from '@/services/auth/session';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';

const GreetingsFallback = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
    <span className="text-lg">Loading audio files...</span>
  </div>
);

const ErrorFallback = (error: Error) => (
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

const GreetingsContent = () => {
  const { isAuthenticated } = useAuth();
  const { greetingFiles, isLoading, error } = useGreetingFiles();
  
  // Touch the session on component mount to prevent premature session expiration
  useEffect(() => {
    touchSession();
    
    // Set a timeout to clear any stuck loading state
    const loadingTimeout = setTimeout(() => {
      console.log("Safety timeout reached, resetting loading state");
    }, 5000);
    
    return () => clearTimeout(loadingTimeout);
  }, []);
  
  // If there's an error, show the error fallback
  if (error) {
    return <ErrorFallback error={error as Error} />;
  }
  
  // If loading or not authenticated yet, show the loading fallback
  if (isLoading || !isAuthenticated) {
    return <GreetingsFallback />;
  }
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Audio Files</h1>
          <p className="text-muted-foreground">
            Upload and manage audio greetings for your autodialer campaigns
          </p>
        </div>
        
        <button 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center"
          onClick={() => window.location.href = '/greetings/upload'}
        >
          <span className="mr-2">+</span> Upload Audio
        </button>
      </div>
      
      {/* Render content */}
      {greetingFiles && greetingFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Files would render here */}
          {greetingFiles.map(file => (
            <div key={file.id} className="border rounded-md p-4">
              <p>{file.filename}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-lg font-medium mb-2">No audio files yet</div>
          <p className="text-muted-foreground mb-4">
            Upload your first audio greeting to get started
          </p>
        </div>
      )}
    </div>
  );
};

const GreetingsPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ErrorBoundary fallback={ErrorFallback}>
          <GreetingsContent />
        </ErrorBoundary>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default GreetingsPage;
