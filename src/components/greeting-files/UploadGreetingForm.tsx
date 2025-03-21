
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Mic } from 'lucide-react';
import { RecordGreetingForm } from './RecordGreetingForm';
import { UploadForm } from './upload/UploadForm';

interface UploadGreetingFormProps {
  userId: string | undefined;
}

export const UploadGreetingForm = ({ userId }: UploadGreetingFormProps) => {
  const [activeTab, setActiveTab] = useState<string>('upload');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a new greeting file</CardTitle>
        <CardDescription>
          Upload or record an audio file to use as your campaign greeting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="record">
              <Mic className="h-4 w-4 mr-2" />
              Record Audio
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <UploadForm userId={userId} />
          </TabsContent>
          
          <TabsContent value="record">
            <RecordGreetingForm userId={userId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
