
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { AudioFileCard } from './AudioFileCard';
import { EmptyGreetingsState } from './EmptyGreetingsState';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useGreetingFiles } from '@/hooks/useGreetingFiles';

interface GreetingFilesListProps {
  userId: string | undefined;
  onUploadClick: () => void;
}

export const GreetingFilesList = ({ userId, onUploadClick }: GreetingFilesListProps) => {
  const { activeAudio, isPlaying, togglePlayback } = useAudioPlayer();
  const { greetingFiles, isLoading } = useGreetingFiles(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!greetingFiles || greetingFiles.length === 0) {
    return <EmptyGreetingsState onUploadClick={onUploadClick} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {greetingFiles.map((file: any) => (
        <AudioFileCard
          key={file.id}
          file={file}
          isPlaying={isPlaying}
          isActiveAudio={activeAudio === file.url}
          onPlayToggle={togglePlayback}
        />
      ))}
    </div>
  );
}
