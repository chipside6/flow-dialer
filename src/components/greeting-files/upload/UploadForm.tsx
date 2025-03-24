
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
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
  const [bucketChecked, setBucketChecked] = useState(false);
  
  // Check if the bucket exists
  useEffect(() => {
    const checkBucket = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const voiceAppBucket = buckets?.find(bucket => bucket.name === 'voice-app-uploads');
        
        if (!voiceAppBucket) {
          console.log('Voice app uploads bucket does not exist, will create on upload');
        } else {
          console.log('Voice app uploads bucket exists:', voiceAppBucket.name);
        }
        
        setBucketChecked(true);
      } catch (error) {
        console.error('Error checking bucket:', error);
        setBucketChecked(true); // Mark as checked anyway to not block UI
      }
    };
    
    checkBucket();
  }, []);
  
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
      // Check if bucket exists and create if needed
      const { data: buckets } = await supabase.storage.listBuckets();
      const voiceAppBucket = buckets?.find(bucket => bucket.name === 'voice-app-uploads');
      
      if (!voiceAppBucket) {
        console.log('Creating voice-app-uploads bucket...');
        const { data: newBucket, error: bucketError } = await supabase.storage.createBucket('voice-app-uploads', {
          public: false
        });
        
        if (bucketError) {
          throw new Error('Failed to create storage bucket: ' + bucketError.message);
        }
        
        // Create public bucket policy
        await supabase.storage.from('voice-app-uploads').getPublicUrl('test');
        console.log('Created new bucket:', newBucket);
      }
      
      // Upload directly to the Supabase storage
      const filePath = `${effectiveUserId}/${Date.now()}-${selectedFile.name}`;
      
      // Show manual progress updates during upload
      setTimeout(() => setUploadProgress(30), 500);
      setTimeout(() => setUploadProgress(50), 1000);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-app-uploads')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      // Update progress to 70% after storage upload completes
      setUploadProgress(70);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('voice-app-uploads')
        .getPublicUrl(filePath);
      
      if (!urlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }
      
      // Update progress to 85% before database entry
      setUploadProgress(85);
      
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
        setUploadProgress(0);
        
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
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload greeting file'
      });
    }
  };
  
  if (!bucketChecked) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Checking storage configuration...</span>
      </div>
    );
  }
  
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
