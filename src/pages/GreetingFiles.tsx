
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GreetingFilesList } from '@/components/greeting-files/GreetingFilesList';
import { RecordGreetingForm } from '@/components/greeting-files/RecordGreetingForm';
import { UploadGreetingForm } from '@/components/greeting-files/UploadGreetingForm';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';
import { EmptyGreetingsState } from '@/components/greeting-files/EmptyGreetingsState';
import { useAuth } from '@/contexts/auth';
import { LoadingState } from '@/components/upgrade/LoadingState';

const GreetingFiles = () => {
  const { user, sessionChecked } = useAuth();
  const { greetingFiles, isLoading, error, isError, refreshGreetingFiles, deleteGreetingFile } = useGreetingFiles();
  const [activeTab, setActiveTab] = useState('files');

  if (!sessionChecked) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-semibold mb-6">Greeting Files</h1>
        <p className="text-muted-foreground">Please log in to manage your greeting files.</p>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleUploadClick = () => {
    setActiveTab('upload');
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Greeting Files</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
            refreshGreetingFiles={refreshGreetingFiles} 
            deleteGreetingFile={deleteGreetingFile}
            onUploadClick={handleUploadClick}
          />
        </TabsContent>
        
        <TabsContent value="record">
          <RecordGreetingForm userId={user.id} refreshGreetingFiles={refreshGreetingFiles} />
        </TabsContent>
        
        <TabsContent value="upload">
          <UploadGreetingForm userId={user.id} refreshGreetingFiles={refreshGreetingFiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GreetingFiles;
