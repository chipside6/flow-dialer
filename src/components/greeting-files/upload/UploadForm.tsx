
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileAudio } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUploadProgress } from '@/hooks/useUploadProgress';
import { UploadProgress } from '../recording/UploadProgress';

interface UploadFormProps {
  userId?: string;
  refreshGreetingFiles?: () => Promise<void>;
}

export const UploadForm: React.FC<UploadFormProps> = ({ userId, refreshGreetingFiles }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { uploadProgress, setUploadProgress } = useUploadProgress(isUploading);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if the file is an audio file
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file');
        setSelectedFile(null);
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    const effectiveUserId = userId || (user ? user.id : null);
    
    if (!effectiveUserId) {
      setError('User not authenticated');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setUploadProgress(10); // Start at 10%
    
    try {
      // Generate a unique filename to prevent conflicts
      const timestamp = Date.now();
      const fileExtension = selectedFile.name.split('.').pop();
      const uniqueFilename = `greeting_${timestamp}.${fileExtension}`;
      const filePath = `${effectiveUserId}/${uniqueFilename}`;
      
      // Update progress to 20% before storage upload begins
      setUploadProgress(20);
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-app-uploads')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      // Simulate progress during upload since we can't track it directly
      // Start a progress simulation that will update every 500ms
      let simulatedProgress = 20;
      const progressInterval = setInterval(() => {
        simulatedProgress += 5;
        // Cap progress at 80% until we confirm upload is complete
        if (simulatedProgress <= 80) {
          setUploadProgress(simulatedProgress);
        }
      }, 500);
      
      // Clear the interval when we're done or if there's an error
      const clearProgressInterval = () => {
        clearInterval(progressInterval);
      };
      
      if (uploadError) {
        clearProgressInterval();
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      // Update progress to 85% before database entry
      clearProgressInterval();
      setUploadProgress(85);
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('voice-app-uploads')
        .getPublicUrl(filePath);
      
      if (!urlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }
      
      // Create record in greeting_files table
      const { data: fileData, error: insertError } = await supabase
        .from('greeting_files')
        .insert({
          user_id: effectiveUserId,
          filename: selectedFile.name,
          file_path: filePath,
          url: urlData.publicUrl,
          file_type: selectedFile.type,
          file_size: selectedFile.size
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }
      
      // Final progress update
      setUploadProgress(100);
      
      // Refresh the list
      if (refreshGreetingFiles) {
        await refreshGreetingFiles();
      } else {
        queryClient.invalidateQueries({ queryKey: ['greetingFiles', effectiveUserId] });
      }
      
      toast({
        title: 'File uploaded',
        description: 'Your greeting file has been uploaded successfully'
      });
      
      // Reset form after a short delay to show 100% completion
      setTimeout(() => {
        setSelectedFile(null);
        setIsUploading(false);
        
        // Reset file input
        const fileInput = document.getElementById('greeting-file') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }, 1500);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload file');
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload greeting file'
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="greeting-file">Choose Audio File</Label>
        <Input 
          id="greeting-file" 
          type="file" 
          accept="audio/*" 
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {selectedFile && (
        <div className="flex items-center gap-2 p-2 border rounded bg-muted/20">
          <FileAudio className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm truncate">{selectedFile.name}</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
      )}
      
      {isUploading && (
        <UploadProgress 
          isUploading={isUploading} 
          uploadProgress={uploadProgress}
          error={error}
        />
      )}
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          'Upload Greeting'
        )}
      </Button>
    </form>
  );
};
