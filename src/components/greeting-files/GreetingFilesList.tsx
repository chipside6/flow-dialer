
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { AudioFileCard } from './AudioFileCard';
import { EmptyGreetingsState } from './EmptyGreetingsState';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';
import { useAuth } from '@/contexts/auth';

interface GreetingFilesListProps {
  userId: string | undefined;
  onUploadClick: () => void;
}

export const GreetingFilesList = ({ userId, onUploadClick }: GreetingFilesListProps) => {
  const { activeAudio, isPlaying, togglePlayback } = useAudioPlayer();
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;
  const { greetingFiles, isLoading, isError, error, deleteGreetingFile } = useGreetingFiles(effectiveUserId);
  
  useEffect(() => {
    // Log the state for debugging
    console.log("GreetingFilesList state:", { 
      effectiveUserId, 
      filesCount: greetingFiles?.length || 0,
      isLoading,
      isError,
      errorMessage: error ? (error as Error).message : undefined
    });
  }, [effectiveUserId, greetingFiles, isLoading, isError, error]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-40 text-destructive">
        <p>Error loading greeting files</p>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <EmptyGreetingsState onUploadClick={onUploadClick} />
      </div>
    );
  }

  if (!greetingFiles || greetingFiles.length === 0) {
    return <EmptyGreetingsState onUploadClick={onUploadClick} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {greetingFiles.map((file) => (
        <AudioFileCard
          key={file.id}
          file={file}
          isPlaying={isPlaying}
          isActiveAudio={activeAudio === file.url}
          onPlayToggle={togglePlayback}
          onDelete={(fileId) => deleteGreetingFile.mutate(fileId)}
        />
      ))}
    </div>
  );
}
