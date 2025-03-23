import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GreetingFilesList } from '@/components/greeting-files/GreetingFilesList';
import { RecordGreetingForm } from '@/components/greeting-files/RecordGreetingForm';
import { UploadGreetingForm } from '@/components/greeting-files/UploadGreetingForm';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';
import { EmptyGreetingsState } from '@/components/greeting-files/EmptyGreetingsState';
import { useAuth } from '@/contexts/auth';

const GreetingFiles = () => {
  const { isAuthenticated, sessionChecked } = useAuth();
  const { greetingFiles, isLoading, error, refreshGreetingFiles } = useGreetingFiles();
  const [activeTab, setActiveTab] = useState('files');

  if (!isAuthenticated) {
    return <p>Please log in to manage your greeting files.</p>;
  }

  if (!sessionChecked) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Greeting Files</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="files">My Files</TabsTrigger>
          <TabsTrigger value="record">Record New</TabsTrigger>
          <TabsTrigger value="upload">Upload File</TabsTrigger>
        </TabsList>
        <TabsContent value="files">
          {isLoading && <p>Loading greeting files...</p>}
          {error && <p>Error: {error.message}</p>}
          {!isLoading && !error && greetingFiles.length === 0 && (
            <EmptyGreetingsState onRefresh={refreshGreetingFiles} />
          )}
          {!isLoading && !error && greetingFiles.length > 0 && (
            <GreetingFilesList greetingFiles={greetingFiles} refreshGreetingFiles={refreshGreetingFiles} />
          )}
        </TabsContent>
        <TabsContent value="record">
          <RecordGreetingForm refreshGreetingFiles={refreshGreetingFiles} />
        </TabsContent>
        <TabsContent value="upload">
          <UploadGreetingForm refreshGreetingFiles={refreshGreetingFiles} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GreetingFiles;
