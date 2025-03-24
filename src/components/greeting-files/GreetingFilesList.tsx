
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyGreetingsState } from './EmptyGreetingsState';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Trash } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AudioFileCard } from './AudioFileCard';
import { LoadingState } from '@/components/upgrade/LoadingState';

interface GreetingFilesListProps {
  greetingFiles: any[];
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refreshGreetingFiles: () => Promise<void>;
  deleteGreetingFile: any;
  onUploadClick?: () => void;
}

export const GreetingFilesList = ({ 
  greetingFiles, 
  isLoading, 
  error, 
  isError,
  refreshGreetingFiles,
  deleteGreetingFile,
  onUploadClick
}: GreetingFilesListProps) => {
  const { toast } = useToast();
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useIsMobile();

  if (isLoading) {
    return <LoadingState message="Loading greeting files..." />;
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error?.message || "Failed to load greeting files"}
        </AlertDescription>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={() => refreshGreetingFiles()}
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </Alert>
    );
  }

  if (greetingFiles.length === 0) {
    return <EmptyGreetingsState onUploadClick={onUploadClick} onRefresh={refreshGreetingFiles} />;
  }

  const handleDelete = async (fileId: string) => {
    try {
      await deleteGreetingFile.mutateAsync(fileId);
    } catch (error: any) {
      console.error("Error in delete handler:", error);
    }
  };

  const handlePlayToggle = (url: string) => {
    if (currentAudio === url && isPlaying) {
      // Pause the current audio
      setIsPlaying(false);
    } else {
      // Play the selected audio
      setCurrentAudio(url);
      setIsPlaying(true);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {greetingFiles.map((file) => (
        <AudioFileCard 
          key={file.id}
          file={file}
          isPlaying={isPlaying && currentAudio === file.url}
          isActiveAudio={currentAudio === file.url}
          onPlayToggle={handlePlayToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
