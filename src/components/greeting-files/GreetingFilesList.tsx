
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { AudioFileCard } from './AudioFileCard';
import { EmptyGreetingsState } from './EmptyGreetingsState';

interface GreetingFilesListProps {
  userId: string | undefined;
  onUploadClick: () => void;
}

export const GreetingFilesList = ({ userId, onUploadClick }: GreetingFilesListProps) => {
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useState<HTMLAudioElement | null>(null);

  // Fetch greeting files
  const { data: greetingFiles, isLoading } = useQuery({
    queryKey: ['greetingFiles'],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('greeting_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Handle audio playback
  const togglePlayback = (url: string) => {
    if (activeAudio === url && isPlaying) {
      // Pause current audio
      if (audioRef[0]) {
        audioRef[0].pause();
      }
      setIsPlaying(false);
    } else {
      // Stop current audio if any
      if (audioRef[0] && isPlaying) {
        audioRef[0].pause();
      }
      
      // Play new audio
      setActiveAudio(url);
      const audio = new Audio(url);
      audioRef[0] = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      
      audio.play().catch(error => {
        console.error('Audio playback error:', error);
      });
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef[0]) {
        audioRef[0].pause();
        audioRef[0] = null;
      }
    };
  }, []);

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
};
