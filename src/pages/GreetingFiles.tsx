
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGreetingFilesQuery, ensureStorageBucket } from "@/hooks/greeting-files/useGreetingFilesQuery";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GreetingFile } from "@/hooks/greeting-files/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GreetingFileList } from "@/components/greeting-files/GreetingFileList";
import { GreetingFileUploader } from "@/components/greeting-files/GreetingFileUploader";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

const GreetingFiles = () => {
  const { user } = useAuth();
  const { data: greetingFiles, isLoading } = useGreetingFilesQuery(user?.id);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for uploading new greeting files
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      // Ensure the storage bucket exists first
      await ensureStorageBucket();
      
      // Generate a unique filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('greetings')
        .upload(`${user?.id}/${filename}`, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicData } = supabase.storage
        .from('greetings')
        .getPublicUrl(`${user?.id}/${filename}`);
      
      // Create record in the database
      const { data: recordData, error: recordError } = await supabase
        .from('greeting_files')
        .insert({
          user_id: user?.id,
          file_name: file.name,
          file_path: uploadData.path,
          public_url: publicData.publicUrl,
          file_type: file.type,
          file_size: file.size
        })
        .select()
        .single();
      
      if (recordError) throw recordError;
      
      return recordData.public_url;
    },
    onSuccess: (data) => {
      toast({
        title: "File uploaded successfully",
        description: "Your greeting file is now available for campaigns"
      });
      queryClient.invalidateQueries({ queryKey: ['greetingFiles', user?.id] });
      setShowUploader(false);
    },
    onError: (error) => {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Mutation for deleting greeting files
  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      // Get the file path first
      const { data: fileData, error: fileError } = await supabase
        .from('greeting_files')
        .select('file_path')
        .eq('id', fileId)
        .single();
      
      if (fileError) throw fileError;
      
      // Delete from storage if path exists
      if (fileData?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('greetings')
          .remove([fileData.file_path]);
        
        if (storageError) throw storageError;
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('greeting_files')
        .delete()
        .eq('id', fileId);
      
      if (dbError) throw dbError;
      
      return fileId;
    },
    onSuccess: (data) => {
      toast({
        title: "File deleted",
        description: "The greeting file has been removed"
      });
      queryClient.invalidateQueries({ queryKey: ['greetingFiles', user?.id] });
    },
    onError: (error) => {
      console.error("Error deleting file:", error);
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "An error occurred during deletion",
        variant: "destructive"
      });
    }
  });

  const handleUpload = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleDelete = (file: GreetingFile) => {
    if (confirm(`Are you sure you want to delete "${file.file_name}"?`)) {
      deleteMutation.mutate(file.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Audio Files</h1>
            <p className="text-muted-foreground">
              Upload and manage audio greetings for your autodialer campaigns
            </p>
          </div>
          
          <Button onClick={() => setShowUploader(true)} disabled={showUploader}>
            <Plus className="mr-2 h-4 w-4" /> Upload Audio
          </Button>
        </div>
        
        {showUploader && (
          <div className="mb-6">
            <GreetingFileUploader 
              onUpload={handleUpload} 
              isUploading={isUploading}
              onCancel={() => setShowUploader(false)}
            />
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <GreetingFileList 
            files={greetingFiles || []} 
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default GreetingFiles;
