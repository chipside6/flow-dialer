
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
    
    try {
      // Create a FormData instance for the file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Get the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // Upload directly to the Supabase storage
      const filePath = `${effectiveUserId}/${Date.now()}-${selectedFile.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-app-uploads')
        .upload(filePath, selectedFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('voice-app-uploads')
        .getPublicUrl(filePath);
      
      // Create record in greeting_files table
      const { error: insertError } = await supabase
        .from('greeting_files')
        .insert({
          user_id: effectiveUserId,
          filename: selectedFile.name,
          file_path: filePath,
          url: urlData.publicUrl,
          file_type: selectedFile.type,
          file_size: selectedFile.size
        });
      
      if (insertError) {
        throw insertError;
      }
      
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
      
      // Reset form
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('greeting-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload file');
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload greeting file'
      });
    } finally {
      setIsUploading(false);
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
