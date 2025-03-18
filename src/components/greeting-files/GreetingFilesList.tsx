
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {greetingFiles.map((file) => (
        <Card key={file.id} className="overflow-hidden">
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'} flex items-center justify-center`}>
            <audio src={file.url} controls={greeting === file.url} className="w-full max-w-full" />
          </CardContent>
          <CardFooter className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-center gap-2 p-3`}>
            <span className={`text-sm truncate ${isMobile ? 'w-full text-center mb-2' : ''}`}>
              {file.filename}
            </span>
            <div className={isMobile ? "flex w-full gap-2" : ""}>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handlePlay(file.url)} 
                className={isMobile ? "flex-1" : "mr-2"}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => handleDelete(file.id)}
                className={isMobile ? "flex-1" : ""}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
