
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useAudioPlayer() {
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const togglePlayback = (url: string) => {
    if (activeAudio === url && isPlaying) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Stop current audio if any
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
      }
      
      // Play new audio
      setActiveAudio(url);
      const audio = new Audio(url);
      audioRef.current = audio;
      setAudioElement(audio);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      
      audio.play().catch(error => {
        toast({
          title: 'Playback error',
          description: 'There was an error playing this audio file.',
          variant: 'destructive',
        });
        console.error('Audio playback error:', error);
      });
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setAudioElement(null);
      }
    };
  }, []);

  return {
    activeAudio,
    isPlaying,
    audioElement,
    togglePlayback
  };
}
