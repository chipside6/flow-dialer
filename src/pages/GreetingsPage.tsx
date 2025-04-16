
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2, FileAudio, RefreshCw } from "lucide-react";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/auth';
import { touchSession } from '@/services/auth/session';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { GreetingFilesList } from '@/components/greeting-files/GreetingFilesList';
import { useNavigate } from 'react-router-dom';

const GreetingsFallback = ({ onRetry }: { onRetry?: () => void }) => (
  <div className="w-full h-48 flex flex-col items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary mb-4" />
    <span className="text-muted-foreground">Loading audio files...</span>
    
    {onRetry && (
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-4"
        onClick={onRetry}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry Loading
      </Button>
    )}
  </div>
);

// Error component for greeting files
const GreetingFilesError = ({ error, onRetry }: { error: Error | null, onRetry: () => void }) => (
  <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
    <h3 className="font-medium flex items-center gap-2">
      <FileAudio className="h-5 w-5" />
      Could not load files
    </h3>
    <p className="mt-1">
      {error?.message || "There was a problem loading your audio files. Please try again."}
    </p>
    <Button 
      variant="outline" 
      size="sm" 
      className="mt-2"
      onClick={onRetry}
    >
      Retry
    </Button>
  </div>
);

const GreetingsContent = () => {
  const { isAuthenticated, user } = useAuth();
  const { 
    greetingFiles, 
    isLoading, 
    error, 
    refreshGreetingFiles, 
    deleteGreetingFile: deleteGreetingFileMutation,
    forceRefresh 
  } = useGreetingFiles();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Touch the session on component mount to prevent premature session expiration
  useEffect(() => {
    touchSession();
  }, []);

  // Add automatic retry if we're stuck in loading for too long
  useEffect(() => {
    if (isLoading && retryCount < 3) {
      const retryTimer = setTimeout(() => {
        console.log(`Auto-retry attempt #${retryCount + 1}`);
        forceRefresh();
        setRetryCount(prev => prev + 1);
      }, 20000); // After 20 seconds of loading, try automatic refresh
      
      return () => clearTimeout(retryTimer);
    }
  }, [isLoading, retryCount, forceRefresh]);

  const handleDelete = async (fileId: string) => {
    try {
      setIsDeleting(true);
      await deleteGreetingFileMutation.mutateAsync(fileId);
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

  const handleRetry = () => {
    forceRefresh();
    setRetryCount(0); // Reset retry count on manual retry
  };
  
  return (
    <div className="container mx-auto py-4 max-w-7xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Audio Files</h1>
          <p className="text-muted-foreground">
            Upload and manage audio greetings for your campaigns
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isLoading && (
            <Button
              variant="outline"
              onClick={handleRetry}
              size="icon"
              title="Refresh files"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            className="bg-primary text-primary-foreground"
            onClick={() => navigate('/greetings/upload')}
          >
            + Upload Audio
          </Button>
        </div>
      </div>
      
      {/* Show error if present */}
      {error && (
        <GreetingFilesError error={error as Error} onRetry={handleRetry} />
      )}
      
      {/* Show loading state */}
      {isLoading && <GreetingsFallback onRetry={handleRetry} />}
      
      {/* Show content when loaded and no error */}
      {!isLoading && !error && (
        <GreetingFilesList 
          files={greetingFiles || []}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

const GreetingsPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ErrorBoundary fallback={(error) => (
          <div className="container mx-auto py-4">
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
              <p className="mb-4">{error?.message || "Could not load files. Please try again later."}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}>
          <GreetingsContent />
        </ErrorBoundary>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default GreetingsPage;
