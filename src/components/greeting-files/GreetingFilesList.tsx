
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
import { useIsMobile } from '@/hooks/use-mobile';

interface GreetingFilesListProps {
  userId?: string;
  onUploadClick: () => void;
}

export const GreetingFilesList = ({ userId, onUploadClick }: GreetingFilesListProps) => {
  const { toast } = useToast();
  const [greeting, setGreeting] = useState('');
  const isMobile = useIsMobile();
  
  // Get greeting files
  const { greetingFiles, isLoading, isError, error, deleteGreetingFile } = useGreetingFiles(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-48" />
        {!isMobile && (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </>
        )}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error?.message || "Failed to load greeting files"}
        </AlertDescription>
      </Alert>
    );
  }

  if (greetingFiles.length === 0) {
    return <EmptyGreetingsState onUploadClick={onUploadClick} />;
  }

  const handleDelete = async (fileId: string) => {
    try {
      await deleteGreetingFile.mutateAsync(fileId);
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

  const handlePlay = async (fileUrl: string) => {
    try {
      // Simple implementation to play the audio
      const audio = new Audio(fileUrl);
      await audio.play();
      setGreeting(fileUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error playing file",
        description: error.message || "Failed to play the greeting file.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {greetingFiles.map((file) => (
        <Card key={file.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="aspect-square flex items-center justify-center p-0 pb-2">
              <audio 
                src={file.url} 
                controls={greeting === file.url || isMobile} 
                className="w-full max-w-full" 
              />
            </div>
            <div className="w-full truncate text-sm font-medium mt-2">
              {file.filename}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center bg-muted/10 p-3">
            <Button variant="outline" size="sm" onClick={() => handlePlay(file.url)} className="h-8">
              <Play className="h-3 w-3 mr-1" />
              <span className="text-xs">Play</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(file.id)} className="h-8">
              <Trash className="h-3 w-3 mr-1" />
              <span className="text-xs">Delete</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
