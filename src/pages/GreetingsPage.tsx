
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2, FileAudio } from "lucide-react";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/auth';
import { touchSession } from '@/services/auth/session';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { GreetingFilesList } from '@/components/greeting-files/GreetingFilesList';
import { useNavigate } from 'react-router-dom';

const GreetingsFallback = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
    <span className="text-lg">Loading audio files...</span>
  </div>
);

// Update the component to take an Error directly, not an object with error property
const ErrorFallback = (error: Error) => (
  <div className="w-full h-96 flex flex-col items-center justify-center">
    <div className="bg-destructive/10 text-destructive px-4 py-6 rounded-md mb-4 w-full max-w-md text-center">
      <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
      <p className="mb-4">{error.message || "Could not load files. Please try again later."}</p>
      <Button 
        onClick={() => window.location.reload()}
        variant="outline"
      >
        Try Again
      </Button>
    </div>
  </div>
);

const GreetingsContent = () => {
  const { isAuthenticated, user } = useAuth();
  const { greetingFiles, isLoading, error, refreshGreetingFiles, deleteGreetingFile } = useGreetingFiles();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Touch the session on component mount to prevent premature session expiration
  useEffect(() => {
    touchSession();
    
    // Set a timeout to clear any stuck loading state
    const loadingTimeout = setTimeout(() => {
      console.log("Safety timeout reached, resetting loading state");
    }, 5000);
    
    return () => clearTimeout(loadingTimeout);
  }, []);

  const handleDelete = async (fileId: string) => {
    try {
      setIsDeleting(true);
      await deleteGreetingFile(fileId);
      toast({
        title: "File deleted",
        description: "Audio file has been removed successfully",
      });
      await refreshGreetingFiles();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting file:", err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // If there's an error, show the error fallback
  if (error) {
    return (
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Audio Files</h1>
            <p className="text-muted-foreground">
              Upload and manage audio greetings for your autodialer campaigns
            </p>
          </div>
          
          <Button 
            className="bg-primary text-primary-foreground"
            onClick={() => navigate('/greetings/upload')}
          >
            + Upload Audio
          </Button>
        </div>
        
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <h3 className="font-medium flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Could not load files
          </h3>
          <p className="mt-1">There was a problem loading your audio files. Please try again later.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => refreshGreetingFiles()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
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
        
        <Button 
          className="bg-primary text-primary-foreground"
          onClick={() => navigate('/greetings/upload')}
        >
          + Upload Audio
        </Button>
      </div>
      
      {/* Render content */}
      <GreetingFilesList 
        files={greetingFiles || []} 
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
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
