
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GreetingFilesList } from '@/components/greeting-files/GreetingFilesList';
import { RecordGreetingForm } from '@/components/greeting-files/RecordGreetingForm';
import { UploadGreetingForm } from '@/components/greeting-files/UploadGreetingForm';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';
import { useAuth } from '@/contexts/auth';
import { LoadingState } from '@/components/upgrade/LoadingState';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GreetingFiles = () => {
  const { user, sessionChecked } = useAuth();
  const { greetingFiles, isLoading, error, isError, refreshGreetingFiles, deleteGreetingFile } = useGreetingFiles();
  const [activeTab, setActiveTab] = useState('files');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Set initialized flag after initial render to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // If we've been waiting too long and session check isn't completed yet,
  // just show the UI anyway instead of getting stuck
  if (!sessionChecked && !isInitialized) {
    return <LoadingState message="Checking authentication..." />;
  }

  // Handle the auth state - even if session isn't checked yet, we can proceed after timeout
  if (sessionChecked && !user) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-semibold mb-6">Greeting Files</h1>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            Please log in to manage your greeting files.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Display network error prominently at the top if there's an issue
  if (isError && error instanceof Error) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-semibold mb-6">Greeting Files</h1>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "Failed to load greeting files"}
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => refreshGreetingFiles()}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleUploadClick = () => {
    setActiveTab('upload');
  };

  // Create a wrapper function to handle the correct typing
  const handleRefreshGreetingFiles = async () => {
    await refreshGreetingFiles();
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold mb-6">Greeting Files</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="files">My Files</TabsTrigger>
          <TabsTrigger value="record">Record New</TabsTrigger>
          <TabsTrigger value="upload">Upload File</TabsTrigger>
        </TabsList>
        
        <TabsContent value="files">
          <GreetingFilesList 
            greetingFiles={greetingFiles} 
            isLoading={isLoading}
            error={error}
            isError={isError}
            refreshGreetingFiles={handleRefreshGreetingFiles} 
            deleteGreetingFile={deleteGreetingFile}
            onUploadClick={handleUploadClick}
          />
        </TabsContent>
        
        <TabsContent value="record">
          <RecordGreetingForm userId={user?.id} refreshGreetingFiles={handleRefreshGreetingFiles} />
        </TabsContent>
        
        <TabsContent value="upload">
          <UploadGreetingForm userId={user?.id} refreshGreetingFiles={handleRefreshGreetingFiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GreetingFiles;
