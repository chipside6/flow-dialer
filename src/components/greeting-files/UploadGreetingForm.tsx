
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Mic } from 'lucide-react';
import { RecordGreetingForm } from './RecordGreetingForm';
import { UploadForm } from './upload/UploadForm';

interface UploadGreetingFormProps {
  userId?: string;
  refreshGreetingFiles?: () => Promise<void>;
}

export const UploadGreetingForm = ({ userId, refreshGreetingFiles }: UploadGreetingFormProps) => {
  const [activeTab, setActiveTab] = useState<string>('upload');

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Add a new greeting file</CardTitle>
        <CardDescription>
          Upload or record an audio file to use as your campaign greeting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="upload" id="upload-tab">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="record" id="record-tab">
              <Mic className="h-4 w-4 mr-2" />
              Record Audio
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <UploadForm userId={userId} refreshGreetingFiles={refreshGreetingFiles} />
          </TabsContent>
          
          <TabsContent value="record">
            <RecordGreetingForm userId={userId} refreshGreetingFiles={refreshGreetingFiles} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
