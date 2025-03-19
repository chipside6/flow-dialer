
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useUploadProgress } from '@/hooks/useUploadProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Mic } from 'lucide-react';
import { RecordGreetingForm } from './RecordGreetingForm';

interface UploadGreetingFormProps {
  userId: string | undefined;
}

export const UploadGreetingForm = ({ userId }: UploadGreetingFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const { uploadProgress, setUploadProgress } = useUploadProgress(isUploading);
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if it's an audio file
      if (!selectedFile.type.startsWith('audio/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an audio file (wav, mp3, etc.)',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !userId) return;
    
    setIsUploading(true);
    
    try {
      // Create form data for the Edge Function
      const formData = new FormData();
      formData.append('file', file);
      
      // Get the token for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Call the Edge Function to upload the file
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-greeting`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );
      
      // Set progress to 100% when upload completes
      setUploadProgress(100);
      
      if (!response.ok) {
        let errorMessage = 'Failed to upload file';
        
        try {
          // Try to parse the error response as JSON
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If parsing fails, use the response text if available
          const text = await response.text();
          errorMessage = text || errorMessage;
          console.error('Parse error:', parseError, 'Response text:', text);
        }
        
        throw new Error(errorMessage);
      }
      
      let result;
      try {
        const text = await response.text();
        // Only try to parse as JSON if the text contains valid JSON
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          result = JSON.parse(text);
        } else {
          console.log('Non-JSON response:', text);
          result = { success: true };
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        // Continue as if upload was successful
        result = { success: true };
      }
      
      // Refresh the greeting files list
      queryClient.invalidateQueries({ queryKey: ['greetingFiles'] });
      
      toast({
        title: 'File uploaded',
        description: 'Your greeting file has been uploaded successfully.',
      });
      
      // Reset the file input
      setFile(null);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      // Short delay before resetting upload state (not the progress)
      // to make sure the 100% progress is shown
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
      
      // Reset the file input element
      const fileInput = document.getElementById('greeting-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

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
            <div className="space-y-2">
              <Label htmlFor="greeting-file">Greeting audio file</Label>
              <Input
                id="greeting-file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <p className="text-sm text-muted-foreground">
                Accepted formats: MP3, WAV, M4A (Max 10MB)
              </p>
            </div>
            {file && (
              <div className="text-sm">
                Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            
            {(isUploading || uploadProgress === 100) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{uploadProgress === 100 ? 'Upload complete!' : 'Uploading...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <div className="pt-2">
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="record">
            <RecordGreetingForm userId={userId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
