import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyGreetingsState } from './EmptyGreetingsState';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Trash } from 'lucide-react';

interface GreetingFilesListProps {
  userId?: string;
  onUploadClick: () => void;
}

export const GreetingFilesList = ({ userId, onUploadClick }: GreetingFilesListProps) => {
  const { toast } = useToast();
  const [greeting, setGreeting] = useState('');
  
  // Get greeting files
  const { files, isLoading, error, deleteFile, playFile } = useGreetingFiles(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || "Failed to load greeting files"}
        </AlertDescription>
      </Alert>
    );
  }

  if (files.length === 0) {
    return <EmptyGreetingsState onUploadClick={onUploadClick} />;
  }

  const handleDelete = async (fileKey: string) => {
    try {
      await deleteFile(fileKey);
      toast({
        title: "File deleted",
        description: "Greeting file has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting file",
        description: error.message || "Failed to delete the greeting file.",
      });
    }
  };

  const handlePlay = async (fileKey: string) => {
    try {
      await playFile(fileKey);
      setGreeting(fileKey);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error playing file",
        description: error.message || "Failed to play the greeting file.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <Card key={file.key}>
          <CardContent className="aspect-square flex items-center justify-center p-4">
            <audio src={file.url} controls={greeting === file.key} className="w-full" />
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <span className="text-sm">{file.name}</span>
            <div>
              <Button variant="outline" size="icon" onClick={() => handlePlay(file.key)}>
                <Play className="h-4 w-4 mr-2" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(file.key)}>
                <Trash className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
