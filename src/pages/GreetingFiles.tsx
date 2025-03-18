
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GreetingFilesList } from '@/components/greeting-files/GreetingFilesList';
import { UploadGreetingForm } from '@/components/greeting-files/UploadGreetingForm';
import { Loader2 } from 'lucide-react';

const GreetingFiles = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('files');

  useEffect(() => {
    console.log("GreetingFiles page - Auth state:", { 
      userId: user?.id, 
      isLoading: authLoading 
    });
  }, [user, authLoading]);

  // Helper function to switch to upload tab
  const goToUploadTab = () => {
    setActiveTab('upload');
    document.getElementById('tab-trigger-upload')?.click();
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
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
};

export default GreetingFiles;
