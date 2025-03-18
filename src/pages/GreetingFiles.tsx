
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { GreetingFilesList } from '@/components/greeting-files/GreetingFilesList';
import { UploadGreetingForm } from '@/components/greeting-files/UploadGreetingForm';

const GreetingFiles = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('files');

  // Helper function to switch to upload tab
  const goToUploadTab = () => {
    setActiveTab('upload');
    document.getElementById('tab-trigger-upload')?.click();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Greeting Audio Files</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger id="tab-trigger-files" value="files">My Greetings</TabsTrigger>
          <TabsTrigger id="tab-trigger-upload" value="upload">Upload New</TabsTrigger>
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
