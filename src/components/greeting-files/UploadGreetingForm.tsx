
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Mic } from 'lucide-react';
import { RecordGreetingForm } from './RecordGreetingForm';
import { FileUploadTab } from './FileUploadTab';

interface UploadGreetingFormProps {
  userId: string | undefined;
}

export const UploadGreetingForm = ({ userId }: UploadGreetingFormProps) => {
  const [activeTab, setActiveTab] = useState<string>('upload');
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl mb-2">Add a new greeting file</CardTitle>
        <CardDescription>
          Upload or record an audio file to use as your campaign greeting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 gap-3 mb-6 w-full">
            <TabsTrigger 
              value="upload" 
              className="px-2 py-2.5 min-h-[44px] flex items-center justify-center"
            >
              <Upload className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="whitespace-nowrap">Upload File</span>
            </TabsTrigger>
            <TabsTrigger 
              value="record" 
              className="px-2 py-2.5 min-h-[44px] flex items-center justify-center"
            >
              <Mic className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="whitespace-nowrap">Record Audio</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <FileUploadTab userId={userId} />
          </TabsContent>
          
          <TabsContent value="record">
            <RecordGreetingForm userId={userId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
