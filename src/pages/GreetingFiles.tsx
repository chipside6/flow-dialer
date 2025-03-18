
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GreetingFilesList } from '@/components/greeting-files/GreetingFilesList';
import { UploadGreetingForm } from '@/components/greeting-files/UploadGreetingForm';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Navbar } from '@/components/Navbar';

const GreetingFiles = () => {
  const { user, isLoading: authLoading, initialized } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('files');
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    console.log("GreetingFiles page - Auth state:", { 
      userId: user?.id, 
      isLoading: authLoading,
      initialized
    });

    // Set a timeout to force UI to render even if auth check takes too long
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 2000); // 2 second timeout
    
    // If auth initialization is complete but no user after a delay, show error
    if (initialized && !user && !authLoading) {
      const errorTimer = setTimeout(() => {
        setShowError(true);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(errorTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [user, authLoading, initialized]);

  // Helper function to switch to upload tab
  const goToUploadTab = () => {
    setActiveTab('upload');
    document.getElementById('tab-trigger-upload')?.click();
  };

  // Show loading state only if auth is loading AND timeout hasn't been reached
  if (authLoading && !user && !timeoutReached) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show auth error if we've detected one
  if (showError && !user && initialized) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Please log in to access your greeting files.
          </AlertDescription>
        </Alert>
        <button 
          onClick={() => window.location.href = '/login'} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md mt-2 hover:bg-primary/90 transition-colors"
        >
          Log in
        </button>
      </div>
    );
  }

  const content = (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6 mt-4 pt-4">
        <h1 className="text-3xl font-bold">Greeting Audio Files</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger id="tab-trigger-files" value="files">My Greetings</TabsTrigger>
          <TabsTrigger id="tab-trigger-upload" value="upload">Add New Greeting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="files">
          <GreetingFilesList 
            userId={user?.id}
            onUploadClick={goToUploadTab}
          />
        </TabsContent>
        
        <TabsContent value="upload">
          <UploadGreetingForm userId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <>
      <Navbar />
      <DashboardLayout>
        {content}
      </DashboardLayout>
    </>
  );
};

export default GreetingFiles;
